import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string | null;
  is_public_instructor: boolean | null;
  status: string | null;
};

type CourseRow = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  updated_at: string;
};

export default async function InstructorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select(
      "id, username, full_name, bio, avatar_url, role, is_public_instructor, status"
    )
    .eq("username", username)
    .single<ProfileRow>();

  if (pErr || !profile) return notFound();

  // safety: only show public active instructors
  if (
    profile.status !== "active" ||
    profile.is_public_instructor !== true ||
    (profile.role !== "instructor" && profile.role !== "admin")
  ) {
    return notFound();
  }

  const { data: courses, error: cErr } = await supabase
    .from("courses")
    .select("id, title, description, price, updated_at")
    .eq("author_id", profile.id)
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  const displayName =
    profile.full_name?.trim() ||
    (profile.username ? `@${profile.username}` : null) ||
    "ინსტრუქტორი";

  return (
    <main className="container-page section-pad">
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link
          href="/instructors"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          ← ყველა ინსტრუქტორი
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full border border-white/10 bg-white/5" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-white/95">
              {displayName}
            </h1>
            <p className="mt-1 text-sm text-white/60">
              {profile.role === "admin" ? "ადმინი • ინსტრუქტორი" : "ინსტრუქტორი"}
              {profile.username ? (
                <span className="text-white/40"> • @{profile.username}</span>
              ) : null}
            </p>

            {profile.bio ? (
              <p className="mt-3 text-sm text-white/70">{profile.bio}</p>
            ) : (
              <p className="mt-3 text-sm text-white/50">ბიო მალე დაემატება</p>
            )}
          </div>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-sm font-semibold text-white/80">
            კურსები ({courses?.length ?? 0})
          </h2>
        </div>

        {cErr ? (
          <p className="mt-3 text-sm text-red-200">
            კურსების ჩატვირთვა ვერ მოხერხდა: {cErr.message}
          </p>
        ) : (courses?.length ?? 0) === 0 ? (
          <p className="mt-3 text-sm text-white/60">ჯერჯერობით კურსები არ არის.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(courses ?? []).map((c: CourseRow) => (
              <Link
                key={c.id}
                href={`/courses/${c.id}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10"
              >
                <div className="text-sm font-semibold text-white/90">
                  {c.title}
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-white/70">
                  {c.description ?? "აღწერა მალე დაემატება"}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs text-white/60">
                  <span>
                    {c.price == null ? "უფასო" : `ფასი: ${c.price}`}
                  </span>
                  <span className="text-white/40">ნახვა →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
