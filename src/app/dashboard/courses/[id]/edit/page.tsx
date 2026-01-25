// =======================================================
// FILE: src/app/dashboard/courses/[id]/edit/page.tsx
// PURPOSE: Shared -> კურსის რედაქტირება + რესურსების მართვა (B)
// ACCESS: admin + instructor
// ROUTE: /dashboard/courses/:id/edit
// NOTES:
// - Server Actions MUST be top-level (not nested), რათა არ ჩაითვალოს render კოდად
// - file path: course-assets bucket
// - DB-ში file url არის stable stub (storage://...), signed URL იქმნება render დროს
// =======================================================

import Link from "next/link";
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

  price_label: PriceLabel | null;
  duration: string | null;
  level: CourseLevel | null;
  locked: boolean | null;
  audience: string | null;
  outcomes: string[] | null;
  topics: string[] | null;
  requirements: string[] | null;
};

type ResourceRow = {
  id: string;
  course_id: string;
  type: "link" | "file";
  title: string | null;
  url: string;
  file_path: string | null;
  mime: string | null;
  size: number | null;
  created_at: string | null;
  created_by: string | null;
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type CourseResourceInsert = {
  course_id: string;
  type: "link" | "file";
  title: string | null;
  url: string;
  file_path: string | null;
  mime: string | null;
  size: number | null;
  created_by: string;
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

function safeFileName(name: string) {
  return name.replace(/[^\w.\-()+\s]/g, "_").replace(/\s+/g, " ").trim();
}

function formatBytes(n: number | null) {
  if (!n || n <= 0) return "";
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

async function assertCoursePermission(opts: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  role: "admin" | "instructor";
  userId: string;
  courseId: string;
}) {
  const { supabase, role, userId, courseId } = opts;

  const { data: existing, error: exErr } = await supabase
    .from("courses")
    .select("author_id")
    .eq("id", courseId)
    .single<{ author_id: string | null }>();

  if (exErr || !existing) {
    redirect(
      "/dashboard/my-courses?error=" + encodeURIComponent("კურსი ვერ მოიძებნა.")
    );
  }

  if (role === "instructor" && existing.author_id !== userId) {
    redirect(
      "/dashboard/my-courses?error=" +
        encodeURIComponent("სხვისი კურსის რედაქტირება არ შეგიძლია.")
    );
  }
}

// =======================================================
// SERVER ACTION: Update course + add new resources
// =======================================================
export async function updateCourseAction(formData: FormData) {
  "use server";

  const courseId = String(formData.get("course_id") ?? "").trim();
  if (!courseId) redirect("/dashboard/my-courses?error=missing_course_id");

  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");
  if (info.role !== "admin" && info.role !== "instructor") redirect("/dashboard");

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

  // ---- course fields
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

  // ---- new resources
  const resourceLinksRaw = String(formData.get("resource_links") ?? "").trim();
  const resource_links = linesToArray(resourceLinksRaw);

  const files = formData.getAll("files") as File[];
  const cleanFiles = files.filter(
    (f) => f && typeof f.name === "string" && f.size > 0
  );

  // ---- validation
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
        encodeURIComponent("გთხოვ შეავსე 'რას ისწავლი' მინიმუმ 1 პუნქტით.")
    );
  }

  const topics = linesToArray(topicsRaw);
  if (topics.length === 0) {
    redirect(
      `/dashboard/courses/${courseId}/edit?error=` +
        encodeURIComponent("გთხოვ შეავსე 'თემები' მინიმუმ 1 თემით.")
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

  // ---- update course
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

  // ---- insert new links
  if (resource_links.length) {
    const linkRows: CourseResourceInsert[] = resource_links.map((url) => ({
      course_id: courseId,
      type: "link",
      title: null,
      url,
      file_path: null,
      mime: null,
      size: null,
      created_by: user.id,
    }));

    const { error: linkErr } = await supabase
      .from("course_resources")
      .insert(linkRows);

    if (linkErr) {
      redirect(
        `/dashboard/courses/${courseId}/edit?error=` +
          encodeURIComponent("ლინკების შენახვა ვერ მოხერხდა: " + linkErr.message)
      );
    }
  }

  // ---- upload new files
  if (cleanFiles.length) {
    const fileRows: CourseResourceInsert[] = [];

    for (const f of cleanFiles) {
      const cleanName = safeFileName(f.name);
      const stamp =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now()); // fallback only in server action
      const path = `courses/${courseId}/${stamp}-${cleanName}`;

      const { error: uploadErr } = await supabase.storage
        .from("course-assets")
        .upload(path, f, { contentType: f.type || undefined, upsert: false });

      if (uploadErr) {
        redirect(
          `/dashboard/courses/${courseId}/edit?error=` +
            encodeURIComponent(
              `ფაილის ატვირთვა ვერ მოხერხდა (${cleanName}): ${uploadErr.message}`
            )
        );
      }

      fileRows.push({
        course_id: courseId,
        type: "file",
        title: cleanName,
        url: `storage://course-assets/${path}`,
        file_path: path,
        mime: f.type || null,
        size: f.size || null,
        created_by: user.id,
      });
    }

    const { error: fileDbErr } = await supabase
      .from("course_resources")
      .insert(fileRows);

    if (fileDbErr) {
      redirect(
        `/dashboard/courses/${courseId}/edit?error=` +
          encodeURIComponent("ფაილების შენახვა ვერ მოხერხდა: " + fileDbErr.message)
      );
    }
  }

  redirect(
    `/dashboard/courses/${courseId}/edit?success=` +
      encodeURIComponent("ცვლილებები შენახულია.")
  );
}

// =======================================================
// SERVER ACTION: Delete resource (DB + storage for files)
// =======================================================
export async function deleteResourceAction(formData: FormData) {
  "use server";

  const courseId = String(formData.get("course_id") ?? "").trim();
  const resourceId = String(formData.get("resource_id") ?? "").trim();
  const filePathRaw = String(formData.get("file_path") ?? "").trim();
  const filePath = filePathRaw ? filePathRaw : null;

  if (!courseId || !resourceId) {
    redirect("/dashboard/my-courses?error=missing_delete_params");
  }

  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");
  if (info.role !== "admin" && info.role !== "instructor") redirect("/dashboard");

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

  if (filePath) {
    const { error: rmErr } = await supabase.storage
      .from("course-assets")
      .remove([filePath]);

    if (rmErr) {
      redirect(
        `/dashboard/courses/${courseId}/edit?error=` +
          encodeURIComponent("ფაილის წაშლა ვერ მოხერხდა: " + rmErr.message)
      );
    }
  }

  const { error: delErr } = await supabase
    .from("course_resources")
    .delete()
    .eq("id", resourceId)
    .eq("course_id", courseId);

  if (delErr) {
    redirect(
      `/dashboard/courses/${courseId}/edit?error=` +
        encodeURIComponent("რესურსის წაშლა ვერ მოხერხდა: " + delErr.message)
    );
  }

  redirect(
    `/dashboard/courses/${courseId}/edit?success=` +
      encodeURIComponent("რესურსი წაიშალა.")
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
      "id,title,description,status,price,author_id,updated_at,price_label,duration,level,locked,audience,outcomes,topics,requirements"
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

  const { data: resources, error: resErr } = await supabase
    .from("course_resources")
    .select("id,course_id,type,title,url,file_path,mime,size,created_at,created_by")
    .eq("course_id", id)
    .order("created_at", { ascending: false })
    .returns<ResourceRow[]>();

  const links = (resources ?? []).filter((r) => r.type === "link");
  const files = (resources ?? []).filter((r) => r.type === "file");

  const signedFileMap = new Map<string, string>();
  await Promise.all(
    files.map(async (r) => {
      if (!r.file_path) return;
      const { data: signed, error: signErr } = await supabase.storage
        .from("course-assets")
        .createSignedUrl(r.file_path, 60 * 30);
      if (!signErr && signed?.signedUrl) signedFileMap.set(r.id, signed.signedUrl);
    })
  );

  const outcomesLines = arrayToLines(course.outcomes);
  const topicsLines = arrayToLines(course.topics);
  const requirementsLines = arrayToLines(course.requirements);

  return (
    <main className="container-page section-pad">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href="/dashboard/my-courses"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          ← ჩემი კურსები
        </Link>

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

      {/* რესურსების სია */}
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-white/90">რესურსები — ლინკები</h2>
            <span className="text-xs text-white/50">{links.length} ცალი</span>
          </div>

          {links.length ? (
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              {links.map((r) => (
                <li key={r.id} className="wrap-break-word">
                  <div className="flex items-start justify-between gap-3">
                    <a
                      className="underline underline-offset-4 hover:text-white"
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {r.title?.trim() || r.url}
                    </a>

                    <form action={deleteResourceAction}>
                      <input type="hidden" name="course_id" value={course.id} />
                      <input type="hidden" name="resource_id" value={r.id} />
                      <input type="hidden" name="file_path" value="" />
                      <button
                        type="submit"
                        className="rounded-lg border border-red-400/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-200 hover:bg-red-500/15"
                      >
                        წაშლა
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-white/70">ლინკები არ არის დამატებული.</p>
          )}
        </div>

        <div className="card p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-white/90">რესურსები — ფაილები</h2>
            <span className="text-xs text-white/50">{files.length} ცალი</span>
          </div>

          {files.length ? (
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              {files.map((r) => {
                const href = signedFileMap.get(r.id) || null;
                const label = r.title?.trim() || r.file_path || "ფაილი";
                const meta = [
                  r.mime ? r.mime : null,
                  typeof r.size === "number" ? formatBytes(r.size) : null,
                ]
                  .filter(Boolean)
                  .join(" • ");

                return (
                  <li key={r.id} className="wrap-break-word">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {href ? (
                          <a
                            className="underline underline-offset-4 hover:text-white"
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {label}
                          </a>
                        ) : (
                          <span className="text-white/60">
                            {label}{" "}
                            <span className="text-xs text-white/40">(ლინკი ვერ შეიქმნა)</span>
                          </span>
                        )}
                        {meta ? <div className="mt-0.5 text-xs text-white/50">{meta}</div> : null}
                      </div>

                      <form action={deleteResourceAction}>
                        <input type="hidden" name="course_id" value={course.id} />
                        <input type="hidden" name="resource_id" value={r.id} />
                        <input type="hidden" name="file_path" value={r.file_path ?? ""} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-400/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-200 hover:bg-red-500/15"
                        >
                          წაშლა
                        </button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-white/70">ფაილები არ არის დამატებული.</p>
          )}

          {resErr ? (
            <p className="mt-3 text-xs text-red-200">
              რესურსების წაკითხვა ვერ მოხერხდა: {resErr.message}
            </p>
          ) : null}
        </div>
      </section>

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
                defaultValue={outcomesLines}
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
                defaultValue={topicsLines}
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
                defaultValue={requirementsLines}
                rows={4}
              />
            </div>
          </div>
        </section>

        <section className="card p-4 md:p-5">
          <h2 className="text-base font-semibold text-white/90">დამატებითი რესურსები</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-sm text-white/80" htmlFor="course-resource-links">
                ახალი ლინკები (optional, თითო ხაზზე ერთი)
              </label>
              <textarea
                id="course-resource-links"
                className="auth-input"
                name="resource_links"
                rows={5}
                placeholder={"მაგ:\nhttps://youtu.be/...\nhttps://drive.google.com/..."}
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm text-white/80" htmlFor="course-files">
                ახალი ფაილების ატვირთვა (optional)
              </label>
              <input
                id="course-files"
                className="auth-input"
                name="files"
                type="file"
                multiple
                accept=".pdf,.zip,.png,.jpg,.jpeg,.webp,.mp4"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-2 md:flex-row md:justify-end md:items-center">
          <Link
            href={`/dashboard/courses/${course.id}`}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 text-center"
          >
            ნახვა
          </Link>

          <button type="submit" className="btn-primary w-full md:w-auto justify-center">
            შენახვა
          </button>
        </div>
      </form>
    </main>
  );
}
