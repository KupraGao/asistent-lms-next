import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";

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

export default async function AdminInstructorCoursesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");
  if (info.role !== "admin") redirect("/dashboard");

  const { id } = await params;

  const supabase = await createClient();

  // 1) Instructor profile
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("id, full_name, username, role")
    .eq("id", id)
    .single<ProfileMini>();

  if (pErr || !profile) {
    return (
      <main className="container-page section-pad">
        <Link
          href="/dashboard/admin/instructors"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          ← ინსტრუქტორები
        </Link>
        <p className="mt-4 text-sm text-red-200">
          ინსტრუქტორი ვერ მოიძებნა.
        </p>
      </main>
    );
  }

  const displayName =
    profile.full_name?.trim() ||
    (profile.username ? `@${profile.username}` : null) ||
    "ინსტრუქტორი";

  // 2) Courses by author_id (admin ხედავს ყველას)
  const { data: courses, error: cErr } = await supabase
    .from("courses")
    .select("id, title, status, updated_at, price")
    .eq("author_id", id)
    .order("updated_at", { ascending: false });

  return (
    <main className="container-page section-pad">
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

      {cErr ? (
        <p className="mt-6 text-sm text-red-200">შეცდომა: {cErr.message}</p>
      ) : null}

      <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
        {(courses ?? []).map((c: CourseRow) => (
          <div key={c.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
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

            <div className="flex flex-wrap items-center gap-2">
              {/* Placeholder actions – შემდეგ ეტაპზე ვამუშავებთ */}
              <Link
                href={`/dashboard/admin/courses/${c.id}`}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10"
              >
                ნახვა
              </Link>
              <button className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10">
                რედაქტირება
              </button>
              <button className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/15">
                წაშლა
              </button>
            </div>
          </div>
        ))}

        {(courses?.length ?? 0) === 0 ? (
          <div className="p-4 text-sm text-white/60">
            ამ ინსტრუქტორს კურსები ჯერ არ აქვს.
          </div>
        ) : null}
      </div>
    </main>
  );
}
