import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type InstructorRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string | null;
};

export default async function InstructorsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, bio, avatar_url, role")
    .eq("is_public_instructor", true)
    .eq("status", "active")
    .in("role", ["instructor", "admin"])
    .order("full_name", { ascending: true });

  if (error) {
    return (
      <main className="container-page section-pad">
        <h1 className="text-2xl font-semibold text-white/95">ინსტრუქტორები</h1>
        <p className="mt-3 text-sm text-red-200">
          ინსტრუქტორების ჩატვირთვა ვერ მოხერხდა: {error.message}
        </p>
      </main>
    );
  }

  const instructors = (data ?? []) as InstructorRow[];

  return (
    <main className="container-page section-pad">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white/95">ინსტრუქტორები</h1>
          <p className="mt-2 text-sm text-white/70">
            აირჩიე ინსტრუქტორი და ნახე მისი კურსები.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {instructors.map((u) => {
          const name =
            u.full_name?.trim() ||
            (u.username ? `@${u.username}` : null) ||
            "ინსტრუქტორი";

          const href = u.username ? `/instructors/${u.username}` : null;

          return (
            <div
              key={u.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full border border-white/10 bg-white/5" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white/90">
                    {name}
                  </div>
                  <div className="text-xs text-white/60">
                    {u.role === "admin" ? "ადმინი • ინსტრუქტორი" : "ინსტრუქტორი"}
                  </div>
                </div>
              </div>

              {u.bio ? (
                <p className="mt-3 line-clamp-3 text-sm text-white/70">
                  {u.bio}
                </p>
              ) : (
                <p className="mt-3 text-sm text-white/50">ბიო მალე დაემატება</p>
              )}

              <div className="mt-4">
                {href ? (
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
                  >
                    პროფილის ნახვა →
                  </Link>
                ) : (
                  <span className="text-xs text-white/50">
                    პროფილის ლინკი მიუწვდომელია (username არ არის)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
