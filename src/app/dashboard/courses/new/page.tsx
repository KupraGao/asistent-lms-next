// =======================================================
// FILE: src/app/dashboard/courses/new/page.tsx
// PURPOSE: Shared -> ახალი კურსის შექმნა (ფორმა + Server Action)
// ACCESS: admin + instructor (student არ უნდა შევუშვათ)
// =======================================================

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";

// =======================================================
// SERVER ACTION: createCourseAction
// - იღებს FormData-ს
// - ამოწმებს აუცილებელ ველებს
// - წერს Supabase "courses" ცხრილში
// - redirect-ით აბრუნებს error/success მესიჯებს
// =======================================================
async function createCourseAction(formData: FormData) {
  "use server";

  // -----------------------------
  // A) Role guard (admin/instructor only)
  // ✅ FIX: ადრე მხოლოდ admin იყო
  // -----------------------------
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");
  if (info.role !== "admin" && info.role !== "instructor") {
    redirect("/dashboard?error=" + encodeURIComponent("კურსის შექმნა მხოლოდ ინსტრუქტორს/ადმინს შეუძლია."));
  }

  // -----------------------------
  // 1) FormData -> value parsing
  // -----------------------------
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "draft").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();

  // -----------------------------
  // 2) Validation: title required
  // -----------------------------
  if (!title) {
    // ✅ FIX: redirect ახალ მისამართზე
    redirect(
      "/dashboard/courses/new?error=" +
        encodeURIComponent("კურსის სათაური აუცილებელია.")
    );
  }

  // -----------------------------
  // 3) Normalize: status + price
  // -----------------------------
  const status = statusRaw === "published" ? "published" : "draft";
  const price = priceRaw ? Number(priceRaw) : null;

  // -----------------------------
  // 4) Validation: price format
  // -----------------------------
  if (priceRaw && Number.isNaN(price)) {
    // ✅ FIX: redirect ახალ მისამართზე
    redirect(
      "/dashboard/courses/new?error=" +
        encodeURIComponent("ფასის ფორმატი არასწორია.")
    );
  }

  // -----------------------------
  // 5) Auth: current user
  // -----------------------------
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  // -----------------------------
  // 6) Insert: courses table
  // NOTE: author_id = user.id
  // -----------------------------
  const { error } = await supabase.from("courses").insert({
    title,
    description: description || null,
    status,
    price,
    author_id: user.id,
  });

  // -----------------------------
  // 7) Error / Success redirect
  // -----------------------------
  if (error) {
    redirect(
      "/dashboard/courses/new?error=" +
        encodeURIComponent("კურსის შექმნა ვერ მოხერხდა: " + error.message)
    );
  }

  // ✅ FIX: success redirect ახალ სიის გვერდზე
  redirect(
    "/dashboard/courses?success=" + encodeURIComponent("კურსი შეიქმნა.")
  );
}

// =======================================================
// PAGE: CourseNewPage
// - role guard (admin/instructor)
// - კითხულობს searchParams error/success-ს
// - აჩვენებს კურსის შექმნის ფორმას
// =======================================================
export default async function CourseNewPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  // -----------------------------
  // A) Role guard
  // ✅ FIX: admin + instructor
  // -----------------------------
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");
  if (info.role !== "admin" && info.role !== "instructor") {
    redirect("/dashboard");
  }

  // -----------------------------
  // B) Read query params
  // -----------------------------
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
      {/* =========================
          HEADINGS
         ========================= */}
      <h1 className="text-2xl font-semibold text-white/95">კურსის შექმნა</h1>
      <p className="mt-2 text-sm text-white/70">
        MVP: სათაური, აღწერა, სტატუსი, ფასი (სურვილისამებრ)
      </p>

      {/* =========================
          ALERTS: error/success
         ========================= */}
      {error && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-red-200">
          {decodeURIComponent(error)}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-emerald-200">
          {decodeURIComponent(success)}
        </div>
      )}

      {/* =========================
          FORM
         ========================= */}
      <form action={createCourseAction} className="mt-6 grid gap-3">
        {/* --- Title --- */}
        <input
          className="auth-input"
          name="title"
          required
          placeholder="კურსის სათაური"
        />

        {/* --- Description --- */}
        <textarea
          className="auth-input min-h-[120px]"
          name="description"
          placeholder="კურსის აღწერა (სურვილისამებრ)"
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* --- Status --- */}
          <select
            className="auth-input"
            name="status"
            defaultValue="draft"
            aria-label="კურსის სტატუსი"
            title="კურსის სტატუსი"
          >
            <option value="draft">დრაფტი</option>
            <option value="published">გამოქვეყნებული</option>
          </select>

          {/* --- Price --- */}
          <input
            className="auth-input"
            name="price"
            type="number"
            step="0.01"
            placeholder="ფასი (სურვილისამებრ)"
          />
        </div>

        {/* --- Submit --- */}
        <button type="submit" className="btn-primary w-full justify-center">
          შექმნა
        </button>
      </form>
    </main>
  );
}
