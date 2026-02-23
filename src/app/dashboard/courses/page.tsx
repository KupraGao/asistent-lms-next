// =======================================================
// FILE: src/app/dashboard/courses/page.tsx
// PURPOSE: Dashboard Courses List
// - Admin: ALL courses + manage actions (publish/delete/edit)
// - Instructor/Student: Published-only catalog
// NOTES:
// - /dashboard/courses => list + search + status filter (admin can use status filter)
// - Author shown on a separate line (admin only)
// - Added students count via enrollments(count)
// - Added "სტუდენტები: X" ACTION button next to edit/draft/delete (admin only actions)
// =======================================================

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import CourseRowActions from "./ui/CourseRowActions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type CourseStatus = "draft" | "published";

type CourseRow = {
  id: string;
  title: string;
  status: CourseStatus | null;
  author_id: string | null;
  updated_at: string | null;

  // ✅ ზოგჯერ Supabase აბრუნებს ობიექტს, ზოგჯერ array-ს — ორივეს გავუძლებთ
  author?: { full_name: string | null } | { full_name: string | null }[] | null;

  // ✅ students count (via enrollments(count))
  enrollments?: { count: number }[] | null;
};

function firstParam(v: string | string[] | undefined): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0] ?? "";
  return "";
}

function formatUpdatedAt(v: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("ka-GE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAuthorName(author: CourseRow["author"]): string {
  if (!author) return "—";
  if (Array.isArray(author)) return author?.[0]?.full_name?.trim() || "—";
  return author.full_name?.trim() || "—";
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

  const status: "" | CourseStatus =
    isAdmin && (statusParam === "draft" || statusParam === "published")
      ? statusParam
      : "";

  // -----------------------------
  // 3) Build query
  // -----------------------------
  let query = supabase
    .from("courses")
    .select(
      `
      id,
      title,
      status,
      author_id,
      updated_at,
      author:profiles(full_name),
      enrollments(count)
    `
    )
    .order("updated_at", { ascending: false });

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
      </div>

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

      {error ? (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          ვერ ჩაიტვირთა კურსები: {error.message}
        </div>
      ) : null}

      <div className="mt-6 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5">
        {courses.length === 0 ? (
          <div className="p-5 text-sm text-white/60">კურსი ვერ მოიძებნა.</div>
        ) : (
          courses.map((c) => {
            const authorName = getAuthorName(c.author);
            const updatedLabel = formatUpdatedAt(c.updated_at);
            const studentsCount = c.enrollments?.[0]?.count ?? 0;

            return (
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

                  {/* ზედა ხაზი */}
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/55">
                    <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/75">
                      {c.status === "published" ? "გამოქვეყნებული" : "დრაფტი"}
                    </span>

                    <span className="text-white/55">განახლდა: {updatedLabel}</span>
                  </div>

                  {/* ქვედა ხაზი — ავტორი (მხოლოდ admin) */}
                  {isAdmin ? (
                    <div className="mt-1 text-xs text-white/70">
                      ავტორი:
                      <span className="ml-1 text-white text-sm font-semibold tracking-wide">
                        {authorName}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-2">
                  {/* Students button styled like other buttons */}
                  <Link
                    href={`/dashboard/my-courses/${c.id}/students`}
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 disabled:opacity-60"
                    title="სტუდენტების ნახვა"
                  >
                    სტუდენტები: {studentsCount}
                  </Link>

                  <CourseRowActions
                    courseId={c.id}
                    status={c.status === "published" ? "published" : "draft"}
                    canManage={isAdmin}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}