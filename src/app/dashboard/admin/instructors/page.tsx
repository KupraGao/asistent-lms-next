import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";

type InstructorRow = {
  id: string;
  full_name: string | null;
  username: string | null;
  role: string | null; // instructor/admin/student
  status: string | null; // active/suspended
  is_public_instructor: boolean | null;
};

export default async function AdminInstructorsPage() {
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");
  if (info.role !== "admin") redirect("/dashboard");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, username, role, status, is_public_instructor")
    .in("role", ["instructor", "admin"])
    .order("role", { ascending: true })
    .order("full_name", { ascending: true });

  if (error) {
    return (
      <main className="container-page section-pad">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-white/95">ინსტრუქტორები</h1>
          <Link
            href="/dashboard/admin"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            ← ადმინის პანელი
          </Link>
        </div>

        <p className="mt-4 text-sm text-red-200">
          ჩატვირთვა ვერ მოხერხდა: {error.message}
        </p>
      </main>
    );
  }

  const rows = (data ?? []) as InstructorRow[];

  return (
    <main className="container-page section-pad">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white/95">ინსტრუქტორები</h1>
          <p className="mt-2 text-sm text-white/70">
            აქედან შეძლებ ინსტრუქტორების მართვას (MVP).
          </p>
        </div>

        <Link
          href="/dashboard/admin"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          ← ადმინის პანელი
        </Link>
      </div>

      <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
        {rows.map((u) => {
          const name =
            u.full_name?.trim() ||
            (u.username ? `@${u.username}` : null) ||
            "ინსტრუქტორი";

          return (
            <div key={u.id} className="p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white/90">
                    {name}{" "}
                    <span className="text-xs font-semibold text-white/50">
                      {u.username ? `• @${u.username}` : ""}
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-white/60">
                    როლი:{" "}
                    <span className="text-white/80">
                      {u.role === "admin" ? "ადმინი (ასევე ინსტრუქტორი)" : "ინსტრუქტორი"}
                    </span>{" "}
                    • სტატუსი:{" "}
                    <span className="text-white/80">
                      {u.status ?? "—"}
                    </span>{" "}
                    • საჯარო:{" "}
                    <span className="text-white/80">
                      {u.is_public_instructor ? "კი" : "არა"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Placeholder buttons (შემდეგ ეტაპზე დავამატებთ action-ებს) */}
                  <Link
  href={`/dashboard/admin/instructors/${u.id}/courses`}
  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10">
  კურსები
</Link>

                  <button className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10">
                    კურსის დადების შეზღუდვა
                  </button>
                  <button className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10">
                    სუსპენდირება
                  </button>
                  <button className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/15">
                    წაშლა
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {rows.length === 0 ? (
          <div className="p-4 text-sm text-white/60">ინსტრუქტორები ჯერ არ არის.</div>
        ) : null}
      </div>

      <p className="mt-4 text-xs text-white/50">
        * ახლა ღილაკები placeholder-ია. შემდეგ ნაბიჯზე დავამატებთ რეალურ
        “Toggle / Suspend / Delete” action-ებს Supabase-ს საშუალებით.
      </p>
    </main>
  );
}
