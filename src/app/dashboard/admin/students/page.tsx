// =======================================================
// FILE: src/app/dashboard/admin/students/page.tsx
// PURPOSE: Admin -> ყველა სტუდენტის სია (DB)
// FEATURES:
//   - Search (name/username/email) [ilike]
//   - Filter (status: all/active/suspended)  (თუ გაქვს status)
//   - Sort (created_at desc/asc, name asc)
// ACCESS: მხოლოდ admin
// =======================================================

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import AdminStudentsControls from "@/components/admin/AdminStudentsControls";

type StudentRow = {
  id: string;
  full_name: string | null;
  username: string | null;
  role: string | null;
  status: string | null;
  created_at: string | null;
};

type SortKey = "created_desc" | "created_asc" | "name_asc";

function pickOne(
  sp: Record<string, string | string[] | undefined>,
  key: string
) {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return "";
}

export default async function AdminStudentsPage({
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
  const statusRaw = pickOne(sp, "status").trim(); // all | active | suspended
  const sortRaw = pickOne(sp, "sort").trim(); // created_desc | created_asc | name_asc

  const status: "all" | "active" | "suspended" =
    statusRaw === "active" || statusRaw === "suspended" ? statusRaw : "all";

  const sort: SortKey =
    sortRaw === "created_asc" || sortRaw === "name_asc"
      ? sortRaw
      : "created_desc";

  // =========================
  // 3) Query: profiles (students only)
  // =========================
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, username, role, status, created_at")
    .eq("role", "student");

  // --- Filter: status (თუ გაქვს ეს ველი) ---
  if (status !== "all") {
    query = query.eq("status", status);
  }

  // --- Search: full_name OR username ---
  // NOTE: `or()` სინტაქსით ვაკეთებთ მრავალ ველზე ძიებას
  if (qRaw) {
    const like = `%${qRaw}%`;
    query = query.or(`full_name.ilike.${like},username.ilike.${like}`);
  }

  // --- Sort ---
  if (sort === "name_asc") {
    query = query.order("full_name", { ascending: true, nullsFirst: false });
  } else if (sort === "created_asc") {
    query = query.order("created_at", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  const rows = (data ?? []) as StudentRow[];

  // =========================
  // 4) UI helpers
  // =========================
  const nameOf = (u: StudentRow) =>
    u.full_name?.trim() || (u.username ? `@${u.username}` : null) || "სტუდენტი";

  const statusLabel = (s: string | null) =>
    s === "active" ? "აქტიური" : s === "suspended" ? "სუსპენდირებული" : (s ?? "—");

  return (
    <main className="container-page section-pad">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white/95">სტუდენტები</h1>
          <p className="mt-2 text-sm text-white/70">ყველა სტუდენტის სია (Admin).</p>
        </div>

        <Link
          href="/dashboard/admin"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          ← ადმინის პანელი
        </Link>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-red-200">
          ჩატვირთვა ვერ მოხერხდა: {error.message}
        </div>
      ) : null}

      {/* Controls (Client Component) */}
      <AdminStudentsControls q={qRaw} status={status} sort={sort} />

      {/* List */}
      <div className="mt-4 text-sm text-white/70">
        ნაჩვენებია:{" "}
        <span className="text-white/90 font-semibold">{rows.length}</span> სტუდენტი
      </div>

      <div className="mt-4 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
        {rows.map((u) => (
          <div
            key={u.id}
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white/90">
                {nameOf(u)}
                {u.username ? (
                  <span className="ml-2 text-xs font-semibold text-white/50">
                    • @{u.username}
                  </span>
                ) : null}
              </div>

              <div className="mt-1 text-xs text-white/60">
                სტატუსი:{" "}
                <span className="text-white/80">{statusLabel(u.status)}</span>
                {" • "}
                შექმნა:{" "}
                <span className="text-white/80">{u.created_at ?? "—"}</span>
              </div>
            </div>

            {/* Placeholder actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10"
              >
                ნახვა
              </button>
              <button
                type="button"
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10"
              >
                სუსპენდირება
              </button>
            </div>
          </div>
        ))}

        {rows.length === 0 && !error ? (
          <div className="p-4 text-sm text-white/60">სტუდენტები ვერ მოიძებნა.</div>
        ) : null}
      </div>
    </main>
  );
}
