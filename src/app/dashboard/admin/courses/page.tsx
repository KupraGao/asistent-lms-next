// =======================================================
// FILE: src/app/dashboard/admin/courses/page.tsx
// PURPOSE: Admin -> კურსების სრული სია (DB)
// FEATURES (MVP+):
//   - Search (title)  [Controls in Client Component]
//   - Filter (status: all/draft/published) [auto-submit]
//   - Sort (updated_at desc/asc, title asc) [auto-submit]
// ACCESS: მხოლოდ admin
// =======================================================

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import AdminCoursesControls from "@/components/admin/AdminCoursesControls";

type CourseRow = {
  id: string;
  title: string;
  status: "draft" | "published";
  price: number | null;
  updated_at: string | null;
  author_id: string;
};

type SortKey = "updated_desc" | "updated_asc" | "title_asc";

function pickOne(
  sp: Record<string, string | string[] | undefined>,
  key: string
) {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return "";
}

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  // =========================
  // 1) Role guard (admin-only)
  // =========================
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");
  if (info.role !== "admin") redirect("/dashboard");

  // =========================
  // 2) Read query params
  // =========================
  const sp = (await searchParams) ?? {};

  const qRaw = pickOne(sp, "q").trim();
  const statusRaw = pickOne(sp, "status").trim();
  const sortRaw = pickOne(sp, "sort").trim();

  const status: "all" | "draft" | "published" =
    statusRaw === "draft" || statusRaw === "published" ? statusRaw : "all";

  const sort: SortKey =
    sortRaw === "updated_asc" || sortRaw === "title_asc"
      ? sortRaw
      : "updated_desc";

  // =========================
  // 3) Query: courses
  // =========================
  const supabase = await createClient();

  let query = supabase
    .from("courses")
    .select("id, title, status, price, updated_at, author_id");

  if (status !== "all") query = query.eq("status", status);
  if (qRaw) query = query.ilike("title", `%${qRaw}%`);

  if (sort === "title_asc") query = query.order("title", { ascending: true });
  else if (sort === "updated_asc")
    query = query.order("updated_at", { ascending: true });
  else query = query.order("updated_at", { ascending: false });

  const { data, error } = await query;
  const courses = (data ?? []) as CourseRow[];

  // =========================
  // 4) UI helpers
  // =========================
  const statusLabel = (s: CourseRow["status"]) =>
    s === "published" ? "გამოქვეყნებული" : "დრაფტი";

  const filterLabel =
    status === "draft"
      ? "დრაფტი"
      : status === "published"
      ? "გამოქვეყნებული"
      : "ყველა";

  const sortLabel =
    sort === "title_asc"
      ? "სათაურით (A→Z)"
      : sort === "updated_asc"
      ? "ძველი განახლებები"
      : "ბოლოს განახლებული";

  return (
    <main className="container-page section-pad">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white/95">კურსები</h1>
          <p className="mt-2 text-sm text-white/70">
            ძიება, ფილტრი და სორტირება (Admin).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/admin"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            ← ადმინის პანელი
          </Link>

          <Link
            href="/dashboard/admin/courses/new"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            + კურსის შექმნა
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-red-200">
          ჩატვირთვა ვერ მოხერხდა: {error.message}
        </div>
      ) : null}

      <AdminCoursesControls q={qRaw} status={status} sort={sort} />

      <div className="mt-4 text-sm text-white/70">
        ნაჩვენებია:{" "}
        <span className="text-white/90 font-semibold">{courses.length}</span>{" "}
        კურსი{" • "}ფილტრი:{" "}
        <span className="text-white/90 font-semibold">{filterLabel}</span>{" "}
        {" • "}სორტი:{" "}
        <span className="text-white/90 font-semibold">{sortLabel}</span>
      </div>

      <div className="mt-4 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
        {courses.map((c, idx) => (
          <div
            key={c.id ?? `row-${idx}`}
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white/90">
                {c.title}
              </div>
              <div className="mt-1 text-xs text-white/60">
                სტატუსი:{" "}
                <span className="text-white/80">{statusLabel(c.status)}</span>
                {" • "}ფასი:{" "}
                <span className="text-white/80">
                  {c.price == null ? "უფასო" : `${c.price}`}
                </span>
                {" • "}განახლდა:{" "}
                <span className="text-white/80">{c.updated_at ?? "—"}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {c.id ? (
                <>
                  <Link
                    href={`/dashboard/admin/courses/${c.id}`}
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10"
                  >
                    ნახვა
                  </Link>

                  <Link
                    href={`/dashboard/admin/courses/${c.id}/edit`}
                    className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10"
                  >
                    რედაქტირება
                  </Link>
                </>
              ) : (
                <span className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200">
                  ID აკლია
                </span>
              )}

              <button
                type="button"
                className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/15"
              >
                წაშლა
              </button>
            </div>
          </div>
        ))}

        {courses.length === 0 && !error ? (
          <div className="p-4 text-sm text-white/60">
            კურსები ვერ მოიძებნა ამ ფილტრებით.
          </div>
        ) : null}
      </div>
    </main>
  );
}
