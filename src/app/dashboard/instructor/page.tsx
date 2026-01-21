import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserRole, isRoleAllowed } from "@/lib/auth/role";

export default async function InstructorDashboardPage() {
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");

  if (!isRoleAllowed(info.role, "instructor")) {
    redirect("/dashboard/student");
  }

  // MVP placeholders — შემდეგ ეტაპზე DB query-ებით შეივსება
  const stats = {
    myCourses: "—",
    published: "—",
    drafts: "—",
    students: "—",
  };

  const drafts = [
    { id: "d1", title: "Draft course #1", updatedAt: "—" },
    { id: "d2", title: "Draft course #2", updatedAt: "—" },
  ];

  return (
    <main className="container-page section-pad">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-white/95">
        Instructor Dashboard
      </h1>
      <p className="mt-2 text-sm text-white/70">
        Role: <span className="text-white/85">{info.role}</span>
      </p>

      {/* Overview */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-white/80">Overview</h2>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">My courses</div>
            <div className="mt-1 text-lg font-semibold text-white/90">
              {stats.myCourses}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Published</div>
            <div className="mt-1 text-lg font-semibold text-white/90">
              {stats.published}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Drafts</div>
            <div className="mt-1 text-lg font-semibold text-white/90">
              {stats.drafts}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Students</div>
            <div className="mt-1 text-lg font-semibold text-white/90">
              {stats.students}
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
        <h2 className="text-sm font-semibold text-white/80">Quick actions</h2>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/dashboard/instructor/courses/new"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            ახალი კურსი
          </Link>

          <Link
            href="/dashboard/instructor/courses"
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
            href="/dashboard/instructor/students"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            სტუდენტები
          </Link>
        </div>
      </section>

      {/* Drafts */}
      <section className="mt-6">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-sm font-semibold text-white/80">Drafts to finish</h2>
          <Link
            href="/dashboard/instructor/courses"
            className="text-sm font-semibold text-white/70 hover:text-white/90"
          >
            Open list →
          </Link>
        </div>

        <div className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5">
          {drafts.map((d) => (
            <Link
              key={d.id}
              href="/dashboard/instructor/courses"
              className="flex items-center justify-between gap-4 p-4 hover:bg-white/5"
            >
              <div>
                <div className="text-sm font-semibold text-white/90">
                  {d.title}
                </div>
                <div className="mt-1 text-xs text-white/50">
                  Last update: {d.updatedAt}
                </div>
              </div>
              <span className="text-white/40">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Next steps */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-white/80">Next steps</h2>

        <ol className="mt-3 space-y-2 text-sm text-white/70">
          <li>1) შექმენი/დაამთავრე კურსის აღწერა და cover</li>
          <li>2) დაამატე sections/lessons სტრუქტურა</li>
          <li>3) ატვირთე ვიდეო ან დაამატე YouTube/Vimeo ლინკი</li>
          <li>4) მიამაგრე PDF/ფაილები lesson-ზე</li>
          <li>5) Preview as student → შემდეგ publish (თუ ნებადართულია)</li>
        </ol>
      </section>
    </main>
  );
}
