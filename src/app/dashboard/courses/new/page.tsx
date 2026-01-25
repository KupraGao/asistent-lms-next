// =======================================================
// FILE: src/app/dashboard/courses/new/page.tsx
// PURPOSE: Shared -> ახალი კურსის შექმნა (ფორმა + Server Action + Resources Upload)
// ACCESS: admin + instructor (student არ უნდა შევუშვათ)
// NOTES:
// - ❌ აღარ ვინახავთ DB-ში signed URL-ს (ის იწურება)
// - ✅ DB-ში ვინახავთ file_path-ს და url-ში ვდებ stub-ს (stable), ხოლო signed URL-ს ვქმნით ნახვის დროს
// - ✅ Server Action form-ზე encType/method არ იწერება (Next.js თვითონ აყენებს multipart)
// - (სურვილისამებრ) შეგიძლია დაამატო: export const runtime = "nodejs";
// =======================================================

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type CourseLevel = "დამწყები" | "საშუალო" | "გაღრმავებული";
type PriceLabel = "უფასო" | "ფასიანი";

type CourseResourceInsert = {
  course_id: string;
  type: "link" | "file";
  title: string | null;
  url: string; // link: actual URL, file: stable stub (NOT signed)
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

function safeFileName(name: string) {
  return name.replace(/[^\w.\-()+\s]/g, "_").replace(/\s+/g, " ").trim();
}

// =======================================================
// SERVER ACTION: createCourseAction
// =======================================================
async function createCourseAction(formData: FormData) {
  "use server";

  // A) Role guard (admin/instructor only)
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");

  if (info.role !== "admin" && info.role !== "instructor") {
    redirect(
      "/dashboard?error=" +
        encodeURIComponent("კურსის შექმნა მხოლოდ ინსტრუქტორს/ადმინს შეუძლია.")
    );
  }

  // 1) FormData -> value parsing
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

  const resourceLinksRaw = String(formData.get("resource_links") ?? "").trim();
  const resource_links = linesToArray(resourceLinksRaw);

  const files = formData.getAll("files") as File[];
  const cleanFiles = files.filter(
    (f) => f && typeof f.name === "string" && f.size > 0
  );

  // 2) Validation
  if (!title) {
    redirect(
      "/dashboard/courses/new?error=" +
        encodeURIComponent("კურსის სათაური აუცილებელია.")
    );
  }

  if (!duration) {
    redirect(
      "/dashboard/courses/new?error=" +
        encodeURIComponent("გთხოვ მიუთითე ხანგრძლივობა (მაგ: 2–3 კვირა).")
    );
  }

  if (!audience) {
    redirect(
      "/dashboard/courses/new?error=" +
        encodeURIComponent("გთხოვ მიუთითე ვისთვისაა კურსი.")
    );
  }

  const outcomes = linesToArray(outcomesRaw);
  if (outcomes.length === 0) {
    redirect(
      "/dashboard/courses/new?error=" +
        encodeURIComponent(
          "გთხოვ შეავსე 'რას ისწავლი' მინიმუმ 1 პუნქტით (ყოველი პუნქტი ახალ ხაზზე)."
        )
    );
  }

  const topics = linesToArray(topicsRaw);
  if (topics.length === 0) {
    redirect(
      "/dashboard/courses/new?error=" +
        encodeURIComponent(
          "გთხოვ შეავსე 'თემები' მინიმუმ 1 თემით (ყოველი თემა ახალ ხაზზე)."
        )
    );
  }

  // 3) Normalize
  const status = statusRaw === "published" ? "published" : "draft";

  const priceLabel: PriceLabel =
    priceLabelRaw === "ფასიანი" ? "ფასიანი" : "უფასო";

  const level: CourseLevel =
    levelRaw === "საშუალო"
      ? "საშუალო"
      : levelRaw === "გაღრმავებული"
      ? "გაღრმავებული"
      : "დამწყები";

  const locked = lockedRaw === "true";

  // 4) Price logic
  let price: number | null = null;

  if (priceLabel === "ფასიანი") {
    if (!priceRaw) {
      redirect(
        "/dashboard/courses/new?error=" +
          encodeURIComponent("ფასიან კურსზე ფასი აუცილებელია.")
      );
    }
    const p = Number(priceRaw);
    if (Number.isNaN(p)) {
      redirect(
        "/dashboard/courses/new?error=" +
          encodeURIComponent("ფასის ფორმატი არასწორია.")
      );
    }
    if (p < 0) {
      redirect(
        "/dashboard/courses/new?error=" +
          encodeURIComponent("ფასი არ შეიძლება იყოს უარყოფითი.")
      );
    }
    price = p;
  }

  const requirements = linesToArray(requirementsRaw);

  // 5) Auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  // 6) Insert course
  const { data: created, error: courseErr } = await supabase
    .from("courses")
    .insert({
      title,
      description: description || null,
      status,
      price,
      author_id: user.id,
      price_label: priceLabel,
      duration,
      level,
      locked,
      audience,
      outcomes,
      topics,
      requirements: requirements.length ? requirements : null,
    })
    .select("id")
    .single();

  if (courseErr || !created?.id) {
    redirect(
      "/dashboard/courses/new?error=" +
        encodeURIComponent(
          "კურსის შექმნა ვერ მოხერხდა: " + (courseErr?.message ?? "unknown")
        )
    );
  }

  const courseId = created.id as string;

  // 7) Insert LINKS into course_resources
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
        "/dashboard/courses/new?error=" +
          encodeURIComponent("ლინკების შენახვა ვერ მოხერხდა: " + linkErr.message)
      );
    }
  }

  // 8) Upload FILES + insert rows (DB-ში ვწერთ file_path-ს; signed URL არა)
  if (cleanFiles.length) {
    const fileRows: CourseResourceInsert[] = [];

    for (const f of cleanFiles) {
      const cleanName = safeFileName(f.name);
      const stamp = Date.now();
      const path = `courses/${courseId}/${stamp}-${cleanName}`;

      const { error: uploadErr } = await supabase.storage
        .from("course-assets")
        .upload(path, f, {
          contentType: f.type || undefined,
          upsert: false,
        });

      if (uploadErr) {
        redirect(
          "/dashboard/courses/new?error=" +
            encodeURIComponent(
              `ფაილის ატვირთვა ვერ მოხერხდა (${cleanName}): ${uploadErr.message}`
            )
        );
      }

      const stableUrl = `storage://course-assets/${path}`;

      fileRows.push({
        course_id: courseId,
        type: "file",
        title: cleanName,
        url: stableUrl,
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
        "/dashboard/courses/new?error=" +
          encodeURIComponent(
            "ფაილების ჩანაწერის შენახვა ვერ მოხერხდა: " + fileDbErr.message
          )
      );
    }
  }

  redirect(
    "/dashboard/my-courses?success=" +
      encodeURIComponent("კურსი შეიქმნა და მასალებიც დაემატა.")
  );
}

// =======================================================
// PAGE: CourseNewPage
// =======================================================
export default async function CourseNewPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");

  if (info.role !== "admin" && info.role !== "instructor") {
    redirect("/dashboard");
  }

  const sp = (await searchParams) ?? {};

  const error =
    typeof sp.error === "string"
      ? sp.error
      : Array.isArray(sp.error)
      ? sp.error[0]
      : undefined;

  const success =
    typeof sp.success === "string"
      ? sp.success
      : Array.isArray(sp.success)
      ? sp.success[0]
      : undefined;

  return (
    <main className="container-page section-pad">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white/95">კურსის შექმნა</h1>
        <p className="text-sm text-white/70">
          კურსი + რესურსები: ლინკები და ფაილების ატვირთვა (MVP).
        </p>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-red-200">
          {decodeURIComponent(error)}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-emerald-200">
          {decodeURIComponent(success)}
        </div>
      ) : null}

      {/* ✅ IMPORTANT: Server Action form-ზე encType/method არ ვუთითებთ */}
      <form action={createCourseAction} className="mt-6 grid gap-4">
        {/* =========================
            SECTION 1: BASIC
           ========================= */}
        <section className="card p-4 md:p-5">
          <h2 className="text-base font-semibold text-white/90">
            ძირითადი ინფორმაცია
          </h2>
          <p className="mt-1 text-sm text-white/60">
            ის რაც ბარათზე და preview-ზე გამოჩნდება.
          </p>

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
                placeholder="კურსის სათაური"
                aria-label="კურსის სათაური"
              />
            </div>

            <div className="grid gap-1.5">
              <label
                className="text-sm text-white/80"
                htmlFor="course-description"
              >
                მოკლე აღწერა
              </label>
              <textarea
                id="course-description"
                className="auth-input"
                name="description"
                aria-label="მოკლე აღწერა"
                placeholder="მოკლე აღწერა (ბარათზე/preview-ზე გამოჩნდება)"
                rows={4}
              />
            </div>
          </div>
        </section>

        {/* =========================
            SECTION 2: PRICING / META
           ========================= */}
        <section className="card p-4 md:p-5">
          <h2 className="text-base font-semibold text-white/90">პარამეტრები</h2>
          <p className="mt-1 text-sm text-white/60">
            ფასი, ხანგრძლივობა, დონე და წვდომა.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <label
                className="text-sm text-white/80"
                htmlFor="course-price-label"
              >
                ტიპი (უფასო/ფასიანი)
              </label>
              <select
                id="course-price-label"
                className="auth-input"
                name="price_label"
                defaultValue="უფასო"
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
                placeholder="ფასი (მხოლოდ ფასიანისთვის)"
                aria-label="ფასი (მხოლოდ ფასიანისთვის)"
              />
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="grid gap-1.5">
              <label
                className="text-sm text-white/80"
                htmlFor="course-duration"
              >
                ხანგრძლივობა
              </label>
              <input
                id="course-duration"
                className="auth-input"
                name="duration"
                placeholder="მაგ: 2–3 კვირა"
                required
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
                defaultValue="დამწყები"
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
                defaultValue="false"
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
              defaultValue="draft"
              aria-label="კურსის სტატუსი"
              title="კურსის სტატუსი"
            >
              <option value="draft">დრაფტი</option>
              <option value="published">გამოქვეყნებული</option>
            </select>
          </div>
        </section>

        {/* =========================
            SECTION 3: CONTENT
           ========================= */}
        <section className="card p-4 md:p-5">
          <h2 className="text-base font-semibold text-white/90">
            კურსის დეტალები
          </h2>
          <p className="mt-1 text-sm text-white/60">
            ეს გამოჩნდება “დეტალებში”: ვისთვისაა, რას ისწავლი, თემები და ა.შ.
          </p>

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
                placeholder="ვინ არის მიზნობრივი აუდიტორია?"
                aria-label="ვისთვისაა კურსი"
                rows={3}
              />
            </div>

            <div className="grid gap-1.5">
              <label
                className="text-sm text-white/80"
                htmlFor="course-outcomes"
              >
                რას ისწავლი (თითო ხაზი — 1 პუნქტი)
              </label>
              <textarea
                id="course-outcomes"
                className="auth-input"
                name="outcomes"
                required
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
                aria-label="თემები / სილაბუსი"
                rows={6}
                placeholder={"მაგ:\nHTML Basics\nCSS Basics\nFlex/Grid"}
              />
            </div>

            <div className="grid gap-1.5">
              <label
                className="text-sm text-white/80"
                htmlFor="course-requirements"
              >
                წინაპირობები (optional, თითო ხაზი — 1 პუნქტი)
              </label>
              <textarea
                id="course-requirements"
                className="auth-input"
                name="requirements"
                aria-label="წინაპირობები"
                rows={4}
                placeholder={"მაგ:\nHTML/CSS საბაზისო ცოდნა"}
              />
            </div>
          </div>
        </section>

        {/* =========================
            SECTION 4: RESOURCES
           ========================= */}
        <section className="card p-4 md:p-5">
          <h2 className="text-base font-semibold text-white/90">რესურსები</h2>
          <p className="mt-1 text-sm text-white/60">
            ლინკები და ფაილები, რომლებიც კურსს ერთვის.
          </p>

          <div className="mt-4 grid gap-3">
            <div className="grid gap-1.5">
              <label
                className="text-sm text-white/80"
                htmlFor="course-resource-links"
              >
                მასალების ლინკები (optional)
              </label>
              <textarea
                id="course-resource-links"
                className="auth-input"
                name="resource_links"
                aria-label="მასალების ლინკები"
                rows={4}
                placeholder={
                  "თითო ხაზზე ერთი ლინკი\nმაგ:\nhttps://youtu.be/...\nhttps://drive.google.com/...\nhttps://notion.so/..."
                }
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm text-white/80" htmlFor="course-files">
                ფაილების ატვირთვა (optional)
              </label>
              <input
                id="course-files"
                className="auth-input"
                name="files"
                type="file"
                multiple
                accept=".pdf,.zip,.png,.jpg,.jpeg,.webp,.mp4"
                aria-label="ფაილების ატვირთვა"
                title="ფაილების ატვირთვა"
              />
              <p className="text-xs text-white/60">
                ატვირთე PDF/ZIP/სურათი/ვიდეო. დიდი ვიდეოებისთვის შემდეგ ეტაპზე უკეთეს
                ატვირთვას გავაკეთებთ.
              </p>
            </div>
          </div>
        </section>

        {/* =========================
            ACTIONS
           ========================= */}
        <div className="flex flex-col gap-2 md:flex-row md:justify-end">
          <button
            type="submit"
            className="btn-primary w-full md:w-auto justify-center"
          >
            შექმნა
          </button>
        </div>
      </form>
    </main>
  );
}
