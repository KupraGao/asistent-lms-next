// =======================================================
// FILE: src/app/dashboard/courses/[id]/edit/page.tsx
// PURPOSE: Shared -> კურსის რედაქტირება (მინიმალური) + კურსის წაშლა
// ACCESS: admin + instructor
// ROUTE: /dashboard/courses/:id/edit
// =======================================================

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";

type CourseStatus = "draft" | "published";
type CourseLevel = "დამწყები" | "საშუალო" | "გაღრმავებული";
type PriceLabel = "უფასო" | "ფასიანი";

type CourseRow = {
  id: string;
  title: string;
  description: string | null;
  status: CourseStatus | null;
  price: number | null;
  author_id: string | null;
  price_label: PriceLabel | null;
  duration: string | null;
  level: CourseLevel | null;
  locked: boolean | null;
  audience: string | null;
  outcomes: string[] | null;
  topics: string[] | null;
  requirements: string[] | null;
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function linesToArray(v: string) {
  return v
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

async function assertCoursePermission(opts: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  role: "admin" | "instructor" | "student";
  userId: string;
  courseId: string;
}) {
  const { supabase, role, userId, courseId } = opts;

  if (role === "student") {
    redirect("/dashboard?error=" + encodeURIComponent("წვდომა არ გაქვს."));
  }

  const { data, error } = await supabase
    .from("courses")
    .select("author_id")
    .eq("id", courseId)
    .single<{ author_id: string | null }>();

  if (error || !data) {
    redirect(
      "/dashboard/my-courses?error=" + encodeURIComponent("კურსი ვერ მოიძებნა.")
    );
  }

  if (role === "instructor" && data.author_id !== userId) {
    redirect(
      "/dashboard/my-courses?error=" +
        encodeURIComponent("სხვისი კურსის რედაქტირება არ შეგიძლია.")
    );
  }
}

// =======================================================
// SERVER ACTION: Update course
// =======================================================
export async function updateCourseAction(formData: FormData) {
  "use server";

  const courseId = String(formData.get("course_id") ?? "").trim();
  if (!courseId) redirect("/dashboard/my-courses?error=missing_course_id");

  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");
  if (info.role !== "admin" && info.role !== "instructor") {
    redirect("/dashboard?error=" + encodeURIComponent("წვდომა არ გაქვს."));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  await assertCoursePermission({
    supabase,
    role: info.role,
    userId: user.id,
    courseId,
  });

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  const statusRaw = String(formData.get("status") ?? "draft").trim();
  const priceLabelRaw = String(formData.get("price_label") ?? "უფასო").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();

  const duration = String(formData.get("duration") ?? "").trim();
  const levelRaw = String(formData.get("level") ?? "დამწყები").trim();
  const lockedRaw = String(formData.get("locked") ?? "false").trim();

  const audience = String(formData.get("audience") ?? "").trim();
  const outcomesRaw = String(formData.get("outcomes") ?? "").trim();
  const topicsRaw = String(formData.get("topics") ?? "").trim();
  const requirementsRaw = String(formData.get("requirements") ?? "").trim();

  if (!title) {
    redirect(
      `/dashboard/courses/${courseId}/edit?error=` +
        encodeURIComponent("კურსის სათაური აუცილებელია.")
    );
  }
  if (!duration) {
    redirect(
      `/dashboard/courses/${courseId}/edit?error=` +
        encodeURIComponent("გთხოვ მიუთითე ხანგრძლივობა.")
    );
  }
  if (!audience) {
    redirect(
      `/dashboard/courses/${courseId}/edit?error=` +
        encodeURIComponent("გთხოვ მიუთითე ვისთვისაა კურსი.")
    );
  }

  const outcomes = linesToArray(outcomesRaw);
  if (outcomes.length === 0) {
    redirect(
      `/dashboard/courses/${courseId}/edit?error=` +
        encodeURIComponent("შეავსე 'რას ისწავლი' მინიმუმ 1 პუნქტით.")
    );
  }

  const topics = linesToArray(topicsRaw);
  if (topics.length === 0) {
    redirect(
      `/dashboard/courses/${courseId}/edit?error=` +
        encodeURIComponent("შეავსე 'თემები' მინიმუმ 1 თემით.")
    );
  }

  const status: CourseStatus = statusRaw === "published" ? "published" : "draft";
  const priceLabel: PriceLabel = priceLabelRaw === "ფასიანი" ? "ფასიანი" : "უფასო";

  const level: CourseLevel =
    levelRaw === "საშუალო"
      ? "საშუალო"
      : levelRaw === "გაღრმავებული"
      ? "გაღრმავებული"
      : "დამწყები";

  const locked = lockedRaw === "true";

  let price: number | null = null;
  if (priceLabel === "ფასიანი") {
    if (!priceRaw) {
      redirect(
        `/dashboard/courses/${courseId}/edit?error=` +
          encodeURIComponent("ფასიან კურსზე ფასი აუცილებელია.")
      );
    }
    const p = Number(priceRaw);
    if (Number.isNaN(p) || p < 0) {
      redirect(
        `/dashboard/courses/${courseId}/edit?error=` +
          encodeURIComponent("ფასის ფორმატი არასწორია.")
      );
    }
    price = p;
  } else {
    price = null;
  }

  const requirements = linesToArray(requirementsRaw);

  const supRes = await supabase
    .from("courses")
    .update({
      title,
      description: description || null,
      status,
      price,
      price_label: priceLabel,
      duration,
      level,
      locked,
      audience,
      outcomes,
      topics,
      requirements: requirements.length ? requirements : null,
    })
    .eq("id", courseId);

  if (supRes.error) {
    redirect(
      `/dashboard/courses/${courseId}/edit?error=` +
        encodeURIComponent("შენახვა ვერ მოხერხდა: " + supRes.error.message)
    );
  }

  // ✅ რომ „ნახვა“ გვერდი/სია არ დაგიქეშდეს ძველზე
  revalidatePath("/dashboard/my-courses");
  revalidatePath(`/dashboard/courses/${courseId}`);
  revalidatePath(`/dashboard/courses/${courseId}/edit`);

  redirect(
    `/dashboard/courses/${courseId}/edit?success=` +
      encodeURIComponent("ცვლილებები შენახულია.")
  );
}

// =======================================================
// SERVER ACTION: Delete course
// =======================================================
export async function deleteCourseAction(formData: FormData) {
  "use server";

  const courseId = String(formData.get("course_id") ?? "").trim();
  const confirm = String(formData.get("confirm_delete") ?? "").trim();

  if (!courseId) redirect("/dashboard/my-courses?error=missing_course_id");
  if (confirm !== "yes") {
    redirect(
      `/dashboard/courses/${courseId}/edit?error=` +
        encodeURIComponent("წაშლამდე მონიშნე დადასტურება (checkbox).")
    );
  }

  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");
  if (info.role !== "admin" && info.role !== "instructor") {
    redirect("/dashboard?error=" + encodeURIComponent("წვდომა არ გაქვს."));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  await assertCoursePermission({
    supabase,
    role: info.role,
    userId: user.id,
    courseId,
  });

  const { data: resRows, error: resErr } = await supabase
    .from("course_resources")
    .select("type,file_path")
    .eq("course_id", courseId)
    .returns<{ type: "link" | "file"; file_path: string | null }[]>();

  if (resErr) {
    redirect(
      `/dashboard/courses/${courseId}/edit?error=` +
        encodeURIComponent("რესურსების წაკითხვა ვერ მოხერხდა: " + resErr.message)
    );
  }

  const filePaths = (resRows ?? [])
    .filter((r) => r.type === "file" && r.file_path)
    .map((r) => r.file_path as string);

  if (filePaths.length) {
    const { error: rmErr } = await supabase.storage
      .from("course-assets")
      .remove(filePaths);

    if (rmErr) {
      redirect(
        `/dashboard/courses/${courseId}/edit?error=` +
          encodeURIComponent("ფაილების წაშლა ვერ მოხერხდა: " + rmErr.message)
      );
    }
  }

  const { error: resDelErr } = await supabase
    .from("course_resources")
    .delete()
    .eq("course_id", courseId);

  if (resDelErr) {
    redirect(
      `/dashboard/courses/${courseId}/edit?error=` +
        encodeURIComponent("რესურსების წაშლა ვერ მოხერხდა: " + resDelErr.message)
    );
  }

  const { error: courseDelErr } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId);

  if (courseDelErr) {
    redirect(
      `/dashboard/courses/${courseId}/edit?error=` +
        encodeURIComponent("კურსის წაშლა ვერ მოხერხდა: " + courseDelErr.message)
    );
  }

  // ✅ მთავარი ფიქსი: cache invalidation, რომ სია მაშინვე განახლდეს redirect-ის შემდეგ
  revalidatePath("/dashboard/my-courses");
  // თუ მომავალში გექნება admin list:
  revalidatePath("/dashboard/admin/courses");

  redirect(
    "/dashboard/my-courses?success=" + encodeURIComponent("კურსი წარმატებით წაიშალა.")
  );
}

// =======================================================
// PAGE
// =======================================================
export default async function CourseEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: SearchParams;
}) {
  const { id } = await params;

  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");
  if (info.role !== "admin" && info.role !== "instructor") redirect("/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const { data: course, error } = await supabase
    .from("courses")
    .select(
      "id,title,description,status,price,author_id,price_label,duration,level,locked,audience,outcomes,topics,requirements"
    )
    .eq("id", id)
    .single<CourseRow>();

  if (error || !course) {
    redirect("/dashboard/my-courses?error=" + encodeURIComponent("კურსი ვერ მოიძებნა."));
  }

  if (info.role === "instructor" && course.author_id !== user.id) {
    redirect(
      "/dashboard/my-courses?error=" +
        encodeURIComponent("სხვისი კურსის რედაქტირება არ შეგიძლია.")
    );
  }

  const sp = (await searchParams) ?? {};
  const errorMsg =
    typeof sp.error === "string" ? sp.error : Array.isArray(sp.error) ? sp.error[0] : undefined;
  const successMsg =
    typeof sp.success === "string"
      ? sp.success
      : Array.isArray(sp.success)
      ? sp.success[0]
      : undefined;

  return (
    <main className="container-page section-pad">
      <div className="mb-4 flex items-center justify-between gap-3">
        <a
          href="/dashboard/my-courses"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          ← ჩემი კურსები
        </a>

        <div className="text-xs text-white/55">
          ID: <span className="text-white/75">{course.id}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white/95">კურსის რედაქტირება</h1>
        <p className="text-sm text-white/70">
          {info.role === "admin"
            ? "ადმინი — მართავს ყველა კურსს."
            : "ინსტრუქტორი — მართავს მხოლოდ თავის კურსს."}
        </p>
      </div>

      {errorMsg ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-red-200">
          {decodeURIComponent(errorMsg)}
        </div>
      ) : null}

      {successMsg ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-emerald-200">
          {decodeURIComponent(successMsg)}
        </div>
      ) : null}

      {/* EDIT FORM */}
      <form action={updateCourseAction} className="mt-6 grid gap-4">
        <input type="hidden" name="course_id" value={course.id} />

        <section className="card p-4 md:p-5">
          <h2 className="text-base font-semibold text-white/90">ძირითადი ინფორმაცია</h2>

          <div className="mt-4 grid gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm text-white/80" htmlFor="course-title">
                კურსის სათაური
              </label>
              <input
                id="course-title"
                className="auth-input"
                name="title"
                required
                defaultValue={course.title}
                placeholder="კურსის სათაური"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm text-white/80" htmlFor="course-description">
                მოკლე აღწერა
              </label>
              <textarea
                id="course-description"
                className="auth-input"
                name="description"
                defaultValue={course.description ?? ""}
                placeholder="მოკლე აღწერა (ბარათზე/preview-ზე გამოჩნდება)"
                rows={4}
              />
            </div>
          </div>
        </section>

        <section className="card p-4 md:p-5">
          <h2 className="text-base font-semibold text-white/90">პარამეტრები</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-sm text-white/80" htmlFor="course-price-label">
                ტიპი (უფასო/ფასიანი)
              </label>
              <select
                id="course-price-label"
                className="auth-input"
                name="price_label"
                defaultValue={(course.price_label ?? "უფასო") as PriceLabel}
              >
                <option value="უფასო">უფასო</option>
                <option value="ფასიანი">ფასიანი</option>
              </select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm text-white/80" htmlFor="course-price">
                ფასი
              </label>
              <input
                id="course-price"
                className="auth-input"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={course.price ?? ""}
                placeholder="ფასი (მხოლოდ ფასიანისთვის)"
              />
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="grid gap-1.5">
              <label className="text-sm text-white/80" htmlFor="course-duration">
                ხანგრძლივობა
              </label>
              <input
                id="course-duration"
                className="auth-input"
                name="duration"
                required
                defaultValue={course.duration ?? ""}
                placeholder="მაგ: 2–3 კვირა"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm text-white/80" htmlFor="course-level">
                დონე
              </label>
              <select
                id="course-level"
                className="auth-input"
                name="level"
                defaultValue={(course.level ?? "დამწყები") as CourseLevel}
              >
                <option value="დამწყები">დამწყები</option>
                <option value="საშუალო">საშუალო</option>
                <option value="გაღრმავებული">გაღრმავებული</option>
              </select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm text-white/80" htmlFor="course-locked">
                წვდომა
              </label>
              <select
                id="course-locked"
                className="auth-input"
                name="locked"
                defaultValue={String(course.locked ?? false)}
              >
                <option value="false">Open</option>
                <option value="true">Locked</option>
              </select>
            </div>
          </div>

          <div className="mt-3 grid gap-1.5">
            <label className="text-sm text-white/80" htmlFor="course-status">
              კურსის სტატუსი
            </label>
            <select
              id="course-status"
              className="auth-input"
              name="status"
              defaultValue={(course.status ?? "draft") as CourseStatus}
            >
              <option value="draft">დრაფტი</option>
              <option value="published">გამოქვეყნებული</option>
            </select>
          </div>
        </section>

        <section className="card p-4 md:p-5">
          <h2 className="text-base font-semibold text-white/90">კურსის დეტალები</h2>

          <div className="mt-4 grid gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm text-white/80" htmlFor="course-audience">
                ვისთვისაა კურსი
              </label>
              <textarea
                id="course-audience"
                className="auth-input"
                name="audience"
                required
                defaultValue={course.audience ?? ""}
                rows={3}
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm text-white/80" htmlFor="course-outcomes">
                რას ისწავლი (თითო ხაზი — 1 პუნქტი)
              </label>
              <textarea
                id="course-outcomes"
                className="auth-input"
                name="outcomes"
                required
                defaultValue={(course.outcomes ?? []).join("\n")}
                rows={6}
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm text-white/80" htmlFor="course-topics">
                თემები / სილაბუსი (თითო ხაზი — 1 თემა)
              </label>
              <textarea
                id="course-topics"
                className="auth-input"
                name="topics"
                required
                defaultValue={(course.topics ?? []).join("\n")}
                rows={6}
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm text-white/80" htmlFor="course-requirements">
                წინაპირობები (optional, თითო ხაზი — 1 პუნქტი)
              </label>
              <textarea
                id="course-requirements"
                className="auth-input"
                name="requirements"
                defaultValue={(course.requirements ?? []).join("\n")}
                rows={4}
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-2 md:flex-row md:justify-end md:items-center">
          <a
            href={`/dashboard/courses/${course.id}`}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 text-center"
          >
            ნახვა
          </a>

          <button type="submit" className="btn-primary w-full md:w-auto justify-center">
            შენახვა
          </button>
        </div>
      </form>

      {/* DELETE COURSE */}
      <section className="card mt-4 p-4 md:p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-white/90">კურსის წაშლა</h3>
            <p className="text-sm text-white/65">
              ეს მოქმედება შეუქცევადია — წაიშლება კურსიც და მისი რესურსებიც.
            </p>
          </div>

          <form action={deleteCourseAction} className="flex flex-col gap-2 md:items-end">
            <input type="hidden" name="course_id" value={course.id} />

            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                name="confirm_delete"
                value="yes"
                className="h-4 w-4 accent-red-500"
              />
              ვადასტურებ, რომ მინდა წაშლა
            </label>

            <button
              type="submit"
              className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/15"
            >
              წაშლა
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
