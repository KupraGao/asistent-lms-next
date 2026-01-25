// =======================================================
// FILE: src/app/dashboard/courses/page.tsx
// PURPOSE: Dashboard Courses List
// - Admin: ALL courses + manage actions (publish/delete/edit)
// - Instructor/Student: Published-only catalog
// NOTES:
// - /dashboard/courses => list + search + status filter (admin can use status filter)
// =======================================================

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import CourseRowActions from "./ui/CourseRowActions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type CourseStatus = "draft" | "published";
type CourseRow = {
  id: string;
  title: string;
  status: CourseStatus | null;
  author_id: string | null;
  updated_at: string | null;
};

function firstParam(v: string | string[] | undefined): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0] ?? "";
  return "";
}

export default async function DashboardCoursesPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  // -----------------------------
  // 1) Auth + role guard
  // -----------------------------
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const isAdmin = info.role === "admin";

  // -----------------------------
  // 2) Read query params (search/filter)
  // -----------------------------
  const sp = (await searchParams) ?? {};
  const q = firstParam(sp.q).trim();
  const statusParam = firstParam(sp.status).trim();

  // NOTE:
  // - Admin-ს შეუძლია status ფილტრი (draft/published)
  // - Non-admin-ს status ფილტრი არ ვაძლევთ (რადგან მათ მხოლოდ published კატალოგი უნდა ნახონ)
  const status: "" | CourseStatus =
    isAdmin && (statusParam === "draft" || statusParam === "published")
      ? statusParam
      : "";

  // -----------------------------
  // 3) Build query
  // -----------------------------
  let query = supabase
    .from("courses")
    .select("id,title,status,author_id,updated_at")
    .order("updated_at", { ascending: false });

  // =======================================================
  // ✅ FIX (აქ იყო პრობლემა)
  // ძველი ლოგიკა: non-admin => მხოლოდ თავისი კურსები (author_id=user.id)
  // ახალი ლოგიკა:
  //   - admin => ყველა კურსი (არ ვზღუდავთ)
  //   - instructor/student => მხოლოდ published (კატალოგი)
  // =======================================================
  if (!isAdmin) {
    query = query.eq("status", "published");
  }

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  const courses = (data ?? []) as CourseRow[];

  // -----------------------------
  // 4) UI
  // -----------------------------
  return (
    <main className="container-page section-pad">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white/95">ყველა კურსი</h1>
          <p className="mt-1 text-sm text-white/60">
            {isAdmin
              ? "ადმინი ხედავს ყველა კურსს და აქვს მართვის უფლება."
              : "აქ ჩანს მხოლოდ გამოქვეყნებული კურსები (კატალოგი). შენი კურსები ნახე „ჩემი კურსები“-ში."}
          </p>
        </div>

        {/* create: admin + instructor (თუ new გვერდზე სწორად გაქვს guard) */}
        <Link
          href="/dashboard/courses/new"
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
        >
          კურსის შექმნა
        </Link>
      </div>

      {/* Filters */}
      <form className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px_auto] sm:items-center">
        <input
          name="q"
          defaultValue={q}
          placeholder="ძიება სათაურით…"
          aria-label="კურსების ძებნა სათაურით"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 placeholder:text-white/40"
        />

        <select
          name="status"
          defaultValue={status}
          aria-label="კურსის სტატუსის ფილტრი"
          disabled={!isAdmin}
          title={!isAdmin ? "სტატუსის ფილტრი მხოლოდ ადმინისთვისაა" : undefined}
          className={
            "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 " +
            (!isAdmin ? "opacity-60" : "")
          }
        >
          <option value="">ყველა სტატუსი</option>
          <option value="draft">დრაფტი</option>
          <option value="published">გამოქვეყნებული</option>
        </select>

        <button
          type="submit"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          ძიება
        </button>
      </form>

      {/* Errors */}
      {error ? (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          ვერ ჩაიტვირთა კურსები: {error.message}
        </div>
      ) : null}

      {/* List */}
      <div className="mt-6 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5">
        {courses.length === 0 ? (
          <div className="p-5 text-sm text-white/60">კურსი ვერ მოიძებნა.</div>
        ) : (
          courses.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <Link
                  href={`/dashboard/courses/${c.id}`}
                  className="block truncate text-sm font-semibold text-white/90 hover:text-white"
                  title={c.title}
                >
                  {c.title}
                </Link>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/55">
                  <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/75">
                    {c.status === "published" ? "გამოქვეყნებული" : "დრაფტი"}
                  </span>

                  {isAdmin ? (
                    <span className="text-white/45">ავტორი: {c.author_id ?? "—"}</span>
                  ) : null}
                </div>
              </div>

              <CourseRowActions
                courseId={c.id}
                status={c.status === "published" ? "published" : "draft"}
                canManage={isAdmin}
              />
            </div>
          ))
        )}
      </div>

      <p className="mt-4 text-xs text-white/45">
        შენიშვნა: “ავტორი” ახლა დროებით author_id-ით ჩანს. თუ courses.author_id → profiles.id FK გაქვს,
        ავტორის სახელსაც მარტივად გამოვიტანთ.
      </p>
    </main>
  );
}
