import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/auth/actions";

type MyCourse = {
  id: string;
  title: string;
  progress: number | "—";
  status: "active" | "locked";
};

type Profile = {
  full_name: string | null;
  username: string | null;
  phone: string | null;
  role: string | null;
};

export default async function StudentDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/auth/sign-in?error=" +
        encodeURIComponent("გთხოვ ჯერ შეხვიდე სისტემაში.")
    );
  }

  // ✅ profile წამოღება profiles ცხრილიდან
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, username, phone, role")
    .eq("id", user.id)
    .single<Profile>();

  // თუ profile არ მოიძებნა (არ უნდა ხდებოდეს, მაგრამ MVP-ზე ჯობს უსაფრთხოდ)
  const displayName =
    profile?.full_name?.trim() ||
    (profile?.username ? `@${profile.username}` : null) ||
    "მომხმარებელი";

  const displayUsername = profile?.username ? `@${profile.username}` : null;

  // MVP placeholder მონაცემები
  const stats = {
    myCourses: "—",
    completedLessons: "—",
    inProgress: "—",
  };

  const myCourses: MyCourse[] = [
    {
      id: "c1",
      title: "Front-end საფუძვლები (HTML/CSS)",
      progress: "—",
      status: "active",
    },
    {
      id: "c2",
      title: "JavaScript პრაქტიკა — DOM & ლოგიკა",
      progress: "—",
      status: "locked",
    },
  ];

  return (
    <main className="container-page section-pad">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-white/95">სტუდენტის პანელი</h1>

      <div className="mt-2 space-y-1 text-sm text-white/70">
        <div>
          <span className="text-white/85">{displayName}</span>
          {displayUsername ? (
            <span className="text-white/40"> • </span>
          ) : null}
          {displayUsername ? (
            <span className="text-white/70">{displayUsername}</span>
          ) : null}
        </div>

        <div className="text-white/60">{user.email}</div>

        {/* სურვილისამებრ: დევ-დახმარება (შემდეგ შეგიძლია წაშალო) */}
        {profileError ? (
          <div className="text-xs text-white/40">
            (შენიშვნა: პროფილის წამოღება ვერ მოხერხდა)
          </div>
        ) : null}
      </div>

      {/* Overview */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-white/80">მიმოხილვა</h2>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">ჩემი კურსები</div>
            <div className="mt-1 text-lg font-semibold text-white/90">
              {stats.myCourses}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">მიმდინარე კურსები</div>
            <div className="mt-1 text-lg font-semibold text-white/90">
              {stats.inProgress}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">დასრულებული გაკვეთილები</div>
            <div className="mt-1 text-lg font-semibold text-white/90">
              {stats.completedLessons}
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-white/50">
          * MVP ეტაპზე მონაცემები placeholder-ია — შემდეგ ეტაპზე დაემატება პროგრესის
          რეალური დათვლა
        </p>
      </section>

      {/* Continue learning */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-white/80">სწავლების გაგრძელება</h2>

        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/70">
            ბოლოს გახსნილი გაკვეთილი აქ გამოჩნდება.
          </p>
          <Link
            href="/dashboard"
            className="mt-3 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            გაგრძელება
          </Link>
        </div>
      </section>

      {/* My courses */}
      <section className="mt-6">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-sm font-semibold text-white/80">ჩემი კურსები</h2>
          <Link
            href="/dashboard/student/courses"
            className="text-sm font-semibold text-white/70 hover:text-white/90"
          >
            სრულად ნახვა →
          </Link>
        </div>

        <div className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5">
          {myCourses.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div>
                <div className="text-sm font-semibold text-white/90">{c.title}</div>
                <div className="mt-1 text-xs text-white/55">
                  პროგრესი: {c.progress}
                </div>
              </div>

              {c.status === "active" ? (
                <Link
                  href={`/dashboard/student/courses/${c.id}`}
                  className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
                >
                  გაგრძელება
                </Link>
              ) : (
                <span className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/60">
                  დაბლოკილი
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-white/50">
          * დაბლოკილი კურსები გაიხსნება გადახდის ან წვდომის მინიჭების შემდეგ
        </p>
      </section>

      {/* Actions */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-white/80">სწრაფი მოქმედებები</h2>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/courses" className="btn-secondary">
            კურსების ნახვა
          </Link>
          <Link
            href="/dashboard/instructor/courses"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            ჩემი კურსები
          </Link>
          <Link href="/profile" className="btn-secondary">
            პროფილის რედაქტირება
          </Link>

          <form action={signOutAction}>
            <button type="submit" className="btn-primary">
              გამოსვლა
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
