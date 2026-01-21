import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";

type MiniCourse = {
  id: string;
  title: string;
  status: "draft" | "published";
  authorName: string;
  studentsCount: number | "—";
  updatedAt: string;
};

type MiniInstructor = {
  id: string;
  name: string;
  coursesCount: number | "—";
  studentsCount: number | "—";
};

type Profile = {
  full_name: string | null;
  username: string | null;
  role: string | null;
};

export default async function AdminDashboardPage() {
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");

  if (info.role !== "admin") {
    redirect("/dashboard");
  }

  // ✅ Admin-ის პროფილის წამოღება (header-ისთვის)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, role")
    .eq("id", user.id)
    .single<Profile>();

  const displayName =
    profile?.full_name?.trim() ||
    (profile?.username ? `@${profile.username}` : null) ||
    "ადმინი";

  const displayUsername = profile?.username ? `@${profile.username}` : null;

  // MVP placeholder-ები
  const stats = {
    totalCourses: "—",
    totalInstructors: "—",
    totalStudents: "—",
    paidCourses: "—",
  };

  // Placeholder სიები (შემდეგ DB query-ებით ჩანაცვლდება)
  const recentCourses: MiniCourse[] = [
    {
      id: "c1",
      title: "კურსი (დრაფტი) #1",
      status: "draft",
      authorName: "ინსტრუქტორი A",
      studentsCount: "—",
      updatedAt: "—",
    },
    {
      id: "c2",
      title: "Next.js + Supabase",
      status: "published",
      authorName: "ინსტრუქტორი B",
      studentsCount: "—",
      updatedAt: "—",
    },
    {
      id: "c3",
      title: "JavaScript DOM პრაქტიკა",
      status: "published",
      authorName: "ინსტრუქტორი A",
      studentsCount: "—",
      updatedAt: "—",
    },
  ];

  const instructors: MiniInstructor[] = [
    { id: "i1", name: "ინსტრუქტორი A", coursesCount: "—", studentsCount: "—" },
    { id: "i2", name: "ინსტრუქტორი B", coursesCount: "—", studentsCount: "—" },
    { id: "i3", name: "ინსტრუქტორი C", coursesCount: "—", studentsCount: "—" },
  ];

  const statusLabel = (s: MiniCourse["status"]) =>
    s === "published" ? "გამოქვეყნებული" : "დრაფტი";

  return (
    <main className="container-page section-pad">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-white/95">ადმინის პანელი</h1>

      <div className="mt-2 space-y-1 text-sm text-white/70">
        <div>
          <span className="text-white/85">{displayName}</span>
          {displayUsername ? <span className="text-white/40"> • </span> : null}
          {displayUsername ? (
            <span className="text-white/70">{displayUsername}</span>
          ) : null}
        </div>

        <div className="text-white/60">
          {user.email} •{" "}
          <span className="text-white/85">როლი: {info.role}</span>
        </div>
      </div>

      {/* Overview */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-white/80">მიმოხილვა</h2>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">სულ კურსები</div>
            <div className="mt-1 text-lg font-semibold text-white/90">
              {stats.totalCourses}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">ინსტრუქტორები</div>
            <div className="mt-1 text-lg font-semibold text-white/90">
              {stats.totalInstructors}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">სტუდენტები</div>
            <div className="mt-1 text-lg font-semibold text-white/90">
              {stats.totalStudents}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">ფასიანი კურსები</div>
            <div className="mt-1 text-lg font-semibold text-white/90">
              {stats.paidCourses}
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-white/50">
          * MVP ეტაპზე ეს მონაცემები placeholder-ია — შემდეგ ეტაპზე DB query-ებით
          შეივსება
        </p>
      </section>

      {/* Quick actions */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-white/80">სწრაფი მოქმედებები</h2>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/dashboard/admin/courses"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            ყველა კურსი
          </Link>
<Link
  href="/dashboard/my-courses"
  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
>
  ჩემი კურსები
</Link>
<Link
  href="/dashboard/my-learning"
  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
>
  შეძენილი კურსები
</Link>
          <Link
            href="/dashboard/admin/instructors"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            ინსტრუქტორები
          </Link>

          <Link
            href="/dashboard/admin/students"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            ყველა სტუდენტი
          </Link>

          <Link
            href="/dashboard/admin/courses/new"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            კურსის შექმნა
          </Link>
        </div>
      </section>

      {/* Courses preview */}
      <section className="mt-6">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-sm font-semibold text-white/80">
            ბოლოს განახლებული კურსები
          </h2>
          <Link
            href="/dashboard/admin/courses"
            className="text-sm font-semibold text-white/70 hover:text-white/90"
          >
            სრული სიის ნახვა →
          </Link>
        </div>

        <div className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5">
          {recentCourses.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/admin/courses/${c.id}`}
              className="block p-4 hover:bg-white/5"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-white/90">
                    {c.title}
                  </div>
                  <div className="mt-1 text-xs text-white/55">
                    ავტორი: {c.authorName} • განახლდა: {c.updatedAt}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/75">
                    {statusLabel(c.status)}
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/75">
                    სტუდენტები: {c.studentsCount}
                  </span>
                  <span className="text-white/40">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-3 text-xs text-white/50">
          * თითო კურსზე დეტალებში მოგვიანებით გამოჩნდება სტუდენტების სია და
          სტატუსების მართვა (დრაფტი/გამოქვეყნებული).
        </p>
      </section>

      {/* Instructors preview */}
      <section className="mt-6">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-sm font-semibold text-white/80">
            ინსტრუქტორები (მოკლე სია)
          </h2>
          <Link
            href="/dashboard/admin/instructors"
            className="text-sm font-semibold text-white/70 hover:text-white/90"
          >
            ინსტრუქტორების ნახვა →
          </Link>
        </div>

        <div className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5">
          {instructors.map((u) => (
            <Link
              key={u.id}
              href={`/dashboard/admin/instructors/${u.id}`}
              className="flex items-center justify-between gap-4 p-4 hover:bg-white/5"
            >
              <div>
                <div className="text-sm font-semibold text-white/90">
                  {u.name}
                </div>
                <div className="mt-1 text-xs text-white/55">
                  კურსები: {u.coursesCount} • სტუდენტები (ჯამში): {u.studentsCount}
                </div>
              </div>
              <span className="text-white/40">→</span>
            </Link>
          ))}
        </div>

        <p className="mt-3 text-xs text-white/50">
          * ინსტრუქტორის გვერდზე შემდეგ ეტაპზე გამოვიტანთ: მისი კურსები და თითო
          კურსზე სტუდენტების სია.
        </p>
      </section>

      {/* Next steps */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-white/80">შემდეგი ნაბიჯები</h2>
        <ol className="mt-3 space-y-2 text-sm text-white/70">
          <li>1) კურსების სრული სია: ძიება / ფილტრი / სორტირება / ავტორი</li>
          <li>2) ინსტრუქტორების სია: ინსტრუქტორი → მისი კურსები</li>
          <li>3) კურსის დეტალი: სტუდენტების სია (enrolled)</li>
          <li>4) სტუდენტების სრული სია: ძიება და ფილტრები</li>
        </ol>
      </section>
    </main>
  );
}
