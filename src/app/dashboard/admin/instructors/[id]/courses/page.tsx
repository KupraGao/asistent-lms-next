// =======================================================
// FILE: src/app/dashboard/admin/instructors/[id]/courses/page.tsx
// PURPOSE: Admin -> კონკრეტული ინსტრუქტორის კურსების სია
// ACCESS: მხოლოდ admin
// =======================================================

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";

// =======================================================
// TYPES: პროფილი და კურსის სია (UI-სთვის)
// =======================================================
type ProfileMini = {
  id: string;
  full_name: string | null;
  username: string | null;
  role: string | null;
};

type CourseRow = {
  id: string;
  title: string;
  status: "draft" | "published";
  updated_at: string;
  price: number | null;
};

// =======================================================
// PAGE: AdminInstructorCoursesPage
// - Role guard (admin-only)
// - params.id = ინსტრუქტორის user id
// - კითხულობს profiles + courses ცხრილებს
// - აჩვენებს კურსების სიას + placeholder action-ებს
// =======================================================
export default async function AdminInstructorCoursesPage({
  params,
}: {
  // NOTE: Next.js სტანდარტულად params არის object, არა Promise.
  // თუ შენთან Promise-ად მუშაობს, OK, მაგრამ მომავალში შესაძლოა ტიპებზე გაგიჭედოს.
  params: Promise<{ id: string }>;
}) {
  // -----------------------------
  // 1) Role guard
  // -----------------------------
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");
  if (info.role !== "admin") redirect("/dashboard");

  // -----------------------------
  // 2) Route param: instructor id
  // -----------------------------
  const { id } = await params;

  const supabase = await createClient();

  // -----------------------------
  // 3) Instructor profile (profiles table)
  // -----------------------------
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("id, full_name, username, role")
    .eq("id", id)
    .single<ProfileMini>();

  // თუ ინსტრუქტორი ვერ მოიძებნა
  if (pErr || !profile) {
    return (
      <main className="container-page section-pad">
        <Link
          href="/dashboard/admin/instructors"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          ← ინსტრუქტორები
        </Link>

        <p className="mt-4 text-sm text-red-200">ინსტრუქტორი ვერ მოიძებნა.</p>
      </main>
    );
  }

  // -----------------------------
  // 4) Display name ლოგიკა (სახელი/username fallback)
  // -----------------------------
  const displayName =
    profile.full_name?.trim() ||
    (profile.username ? `@${profile.username}` : null) ||
    "ინსტრუქტორი";

  // -----------------------------
  // 5) Courses by author_id (courses table)
  // NOTE: admin ხედავს draft + published
  // -----------------------------
  const { data: courses, error: cErr } = await supabase
    .from("courses")
    .select("id, title, status, updated_at, price")
    .eq("author_id", id)
    .order("updated_at", { ascending: false });

  return (
    <main className="container-page section-pad">
      {/* =========================
          HEADER: title + navigation
         ========================= */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white/95">
            {displayName} — კურსები
          </h1>
          <p className="mt-2 text-sm text-white/70">
            აქ ჩანს ამ ინსტრუქტორის ყველა კურსი (draft + published).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/admin/instructors"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            ← ინსტრუქტორები
          </Link>

          <Link
            href="/dashboard/admin"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            ადმინის პანელი
          </Link>
        </div>
      </div>

      {/* =========================
          ERROR: courses query
         ========================= */}
      {cErr ? (
        <p className="mt-6 text-sm text-red-200">შეცდომა: {cErr.message}</p>
      ) : null}

      {/* =========================
          LIST: courses
         ========================= */}
      <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
        {(courses ?? []).map((c: CourseRow) => (
          <div
            key={c.id}
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            {/* --- Course meta --- */}
            <div>
              <div className="text-sm font-semibold text-white/90">{c.title}</div>
              <div className="mt-1 text-xs text-white/60">
                სტატუსი:{" "}
                <span className="text-white/80">
                  {c.status === "published" ? "გამოქვეყნებული" : "დრაფტი"}
                </span>{" "}
                • განახლდა:{" "}
                <span className="text-white/80">{c.updated_at ?? "—"}</span>{" "}
                • {c.price == null ? "უფასო" : `ფასი: ${c.price}`}
              </div>
            </div>

            {/* --- Actions: ახლა placeholder --- */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/dashboard/admin/courses/${c.id}`}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10"
              >
                ნახვა
              </Link>

              <button
                type="button"
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10"
              >
                რედაქტირება
              </button>

              <button
                type="button"
                className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/15"
              >
                წაშლა
              </button>
            </div>
          </div>
        ))}

        {/* =========================
            EMPTY STATE
           ========================= */}
        {(courses?.length ?? 0) === 0 ? (
          <div className="p-4 text-sm text-white/60">
            ამ ინსტრუქტორს კურსები ჯერ არ აქვს.
          </div>
        ) : null}
      </div>
    </main>
  );
}
