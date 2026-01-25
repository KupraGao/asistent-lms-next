// =======================================================
// FILE: src/app/dashboard/courses/[id]/edit/page.tsx
// PURPOSE: Shared -> კურსის რედაქტირება (Admin: ნებისმიერი; Instructor: მხოლოდ თავისი)
// ACCESS: admin + instructor
// ROUTE: /dashboard/courses/:id/edit
// =======================================================

import { redirect } from "next/navigation";
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
  updated_at: string | null;

  // extended fields (must exist in DB)
  price_label: PriceLabel | null;
  duration: string | null;
  level: CourseLevel | null;
  locked: boolean | null;
  audience: string | null;
  outcomes: string[] | null;
  topics: string[] | null;
  requirements: string[] | null;
};

function linesToArray(v: string) {
  return v
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function arrayToLines(v: string[] | null | undefined) {
  if (!v || v.length === 0) return "";
  return v.join("\n");
}

// NOTE: editing resources in this page is optional.
// For MVP we only edit course fields; resources can be managed later in a dedicated page.

export default async function CourseEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;

  // -----------------------------
  // 1) Role guard: admin/instructor only
  // -----------------------------
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");
  if (info.role !== "admin" && info.role !== "instructor") {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  // -----------------------------
  // 2) Load course (extended fields)
  // -----------------------------
  const { data: course, error } = await supabase
    .from("courses")
    .select(
      "id,title,description,status,price,author_id,updated_at,price_label,duration,level,locked,audience,outcomes,topics,requirements"
    )
    .eq("id", id)
    .single<CourseRow>();

  if (error || !course) {
    redirect(
      "/dashboard/my-courses?error=" +
        encodeURIComponent("კურსი ვერ მოიძებნა.")
    );
  }

  // -----------------------------
  // 3) Permission check
  // - admin: can edit any
  // - instructor: only own
  // -----------------------------
  if (info.role === "instructor" && course.author_id !== user.id) {
    redirect(
      "/dashboard/my-courses?error=" +
        encodeURIComponent("სხვისი კურსის რედაქტირება არ შეგიძლია.")
    );
  }

  // -----------------------------
  // 4) Server Action (update)
  // -----------------------------
  async function updateCourseAction(courseId: string, formData: FormData) {
    "use server";

    const info = await getUserRole();
    if (!info) redirect("/auth/sign-in");
    if (info.role !== "admin" && info.role !== "instructor") {
      redirect("/dashboard");
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/auth/sign-in");

    // Read inputs
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
          encodeURIComponent("გთხოვ მიუთითე ხანგრძლივობა (მაგ: 2–3 კვირა).")
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
          encodeURIComponent(
            "გთხოვ შეავსე 'რას ისწავლი' მინიმუმ 1 პუნქტით (ყოველი პუნქტი ახალ ხაზზე)."
          )
      );
    }

    const topics = linesToArray(topicsRaw);
    if (topics.length === 0) {
      redirect(
        `/dashboard/courses/${courseId}/edit?error=` +
          encodeURIComponent(
            "გთხოვ შეავსე 'თემები' მინიმუმ 1 თემით (ყოველი თემა ახალ ხაზზე)."
          )
      );
    }

    const status: CourseStatus = statusRaw === "published" ? "published" : "draft";

    const priceLabel: PriceLabel =
      priceLabelRaw === "ფასიანი" ? "ფასიანი" : "უფასო";

    const level: CourseLevel =
      levelRaw === "საშუალო"
        ? "საშუალო"
        : levelRaw === "გაღრმავებული"
        ? "გაღრმავებული"
        : "დამწყები";

    const locked = lockedRaw === "true";

    // Price rule: if paid -> must be a number >= 0, else null
    let price: number | null = null;

    if (priceLabel === "ფასიანი") {
      if (!priceRaw) {
        redirect(
          `/dashboard/courses/${courseId}/edit?error=` +
            encodeURIComponent("ფასიან კურსზე ფასი აუცილებელია.")
        );
      }
      const p = Number(priceRaw);
      if (Number.isNaN(p)) {
        redirect(
          `/dashboard/courses/${courseId}/edit?error=` +
            encodeURIComponent("ფასის ფორმატი არასწორია.")
        );
      }
      if (p < 0) {
        redirect(
          `/dashboard/courses/${courseId}/edit?error=` +
            encodeURIComponent("ფასი არ შეიძლება იყოს უარყოფითი.")
        );
      }
      price = p;
    } else {
      price = null;
    }

    const requirements = linesToArray(requirementsRaw);

    // Permission check again on server action (important)
    const { data: existing, error: exErr } = await supabase
      .from("courses")
      .select("author_id")
      .eq("id", courseId)
      .single<{ author_id: string | null }>();

    if (exErr || !existing) {
      redirect(
        "/dashboard/my-courses?error=" +
          encodeURIComponent("კურსი ვერ მოიძებნა.")
      );
    }

    if (info.role === "instructor" && existing.author_id !== user.id) {
      redirect(
        "/dashboard/my-courses?error=" +
          encodeURIComponent("სხვისი კურსის რედაქტირება არ შეგიძლია.")
      );
    }

    // Update
    const { error: upErr } = await supabase
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

    if (upErr) {
      redirect(
        `/dashboard/courses/${courseId}/edit?error=` +
          encodeURIComponent("შენახვა ვერ მოხერხდა: " + upErr.message)
      );
    }

    redirect(
      "/dashboard/my-courses?success=" +
        encodeURIComponent("ცვლილებები შენახულია.")
    );
  }

  const action = updateCourseAction.bind(null, course.id);

  // -----------------------------
  // 5) Alerts
  // -----------------------------
  const sp = (await searchParams) ?? {};
  const errorMsg =
    typeof sp.error === "string"
      ? sp.error
      : Array.isArray(sp.error)
      ? sp.error[0]
      : undefined;

  const successMsg =
    typeof sp.success === "string"
      ? sp.success
      : Array.isArray(sp.success)
      ? sp.success[0]
      : undefined;

  // -----------------------------
  // 6) Defaults for textarea (json arrays -> lines)
  // -----------------------------
  const outcomesLines = arrayToLines(course.outcomes);
  const topicsLines = arrayToLines(course.topics);
  const requirementsLines = arrayToLines(course.requirements);

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

      <form action={action} className="mt-6 grid gap-4">
        {/* =========================
            SECTION 1: BASIC
           ========================= */}
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
                aria-label="კურსის სათაური"
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
                aria-label="მოკლე აღწერა"
                rows={4}
              />
            </div>
          </div>
        </section>

        {/* =========================
            SECTION 2: META
           ========================= */}
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
                aria-label="ტიპი (უფასო/ფასიანი)"
                title="ტიპი (უფასო/ფასიანი)"
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
                aria-label="ფასი (მხოლოდ ფასიანისთვის)"
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
                aria-label="ხანგრძლივობა"
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
                aria-label="დონე"
                title="დონე"
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
                aria-label="წვდომა"
                title="წვდომა"
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
              aria-label="კურსის სტატუსი"
              title="კურსის სტატუსი"
            >
              <option value="draft">დრაფტი</option>
              <option value="published">გამოქვეყნებული</option>
            </select>
          </div>
        </section>

        {/* =========================
            SECTION 3: DETAILS
           ========================= */}
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
                placeholder="ვინ არის მიზნობრივი აუდიტორია?"
                aria-label="ვისთვისაა კურსი"
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
                defaultValue={outcomesLines}
                aria-label="რას ისწავლი"
                rows={6}
                placeholder={"მაგ:\nHTML სტრუქტურა\nCSS layout\nResponsive UI"}
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
                defaultValue={topicsLines}
                aria-label="თემები / სილაბუსი"
                rows={6}
                placeholder={"მაგ:\nHTML Basics\nCSS Basics\nFlex/Grid"}
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
                defaultValue={requirementsLines}
                aria-label="წინაპირობები"
                rows={4}
                placeholder={"მაგ:\nHTML/CSS საბაზისო ცოდნა"}
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-2 md:flex-row md:justify-end">
          <button type="submit" className="btn-primary w-full md:w-auto justify-center">
            შენახვა
          </button>
        </div>
      </form>
    </main>
  );
}
