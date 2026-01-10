import Link from "next/link";
import { notFound } from "next/navigation";

/* ================= Types ================= */

type Course = {
  id: string;
  title: string;
  desc: string;
  level: "დამწყები" | "საშუალო" | "გაღრმავებული";
  priceLabel: "უფასო" | "ფასიანი";
  locked: boolean;
  duration: string;
  outcomes: string[];
  syllabusPreview: { title: string; items: string[] }[];
};

/* ================= Data ================= */

const COURSES: Course[] = [
  {
    id: "c1",
    title: "Front-end საფუძვლები (HTML/CSS)",
    desc: "სტრუქტურა, სტილები, რესპონსივი და მცირე პრაქტიკული პროექტები.",
    level: "დამწყები",
    priceLabel: "უფასო",
    locked: false,
    duration: "2–3 კვირა",
    outcomes: [
      "HTML სტრუქტურის სწორად აწყობა (semantic markup)",
      "CSS layout: Flex/Grid, responsive მიდგომა",
      "კომპონენტური UI აზროვნება (cards, forms, sections)",
      "მცირე პრაქტიკული გვერდების აწყობა",
    ],
    syllabusPreview: [
      {
        title: "Module 1 — HTML საფუძვლები",
        items: ["Tags & structure", "Semantic HTML", "Forms basics"],
      },
      {
        title: "Module 2 — CSS საფუძვლები",
        items: ["Selectors", "Box model", "Typography & spacing"],
      },
      {
        title: "Module 3 — Responsive",
        items: ["Flex/Grid", "Breakpoints", "Small project"],
      },
    ],
  },
  {
    id: "c2",
    title: "JavaScript პრაქტიკა — DOM & ლოგიკა",
    desc: "სავარჯიშოები რეალური UI ამოცანებით: events, state, ფორმები.",
    level: "საშუალო",
    priceLabel: "ფასიანი",
    locked: true,
    duration: "4 კვირა",
    outcomes: [
      "DOM manipulation და Event-driven UI",
      "State-ის მართვა მარტივ UI ამოცანებში",
      "Form validation და user feedback patterns",
      "მინი-პროექტები: widgets, interactive UI",
    ],
    syllabusPreview: [
      {
        title: "Module 1 — DOM საფუძვლები",
        items: ["Selectors", "Events", "DOM updates"],
      },
      {
        title: "Module 2 — State & Logic",
        items: ["Conditions", "Loops", "Local state patterns"],
      },
      {
        title: "Module 3 — Practice",
        items: ["Form UX", "UI tasks", "Mini project"],
      },
    ],
  },
  {
    id: "c3",
    title: "Next.js + Supabase — Auth & მონაცემები",
    desc: "ავტორიზაცია, როლები, მონაცემთა მოდელი და დაცვა.",
    level: "გაღრმავებული",
    priceLabel: "ფასიანი",
    locked: true,
    duration: "6 კვირა",
    outcomes: [
      "Next.js App Router-ის სწორი არქიტექტურა",
      "Supabase Auth ინტეგრაცია და session flow",
      "DB მოდელირება + policies (RLS) საფუძვლები",
      "Protected routes და უსაფრთხო data fetching",
    ],
    syllabusPreview: [
      {
        title: "Module 1 — Next.js structure",
        items: ["Routing", "Layouts", "Server components mindset"],
      },
      {
        title: "Module 2 — Supabase Auth",
        items: ["Sign in/up", "Session", "Server client"],
      },
      {
        title: "Module 3 — Data & Security",
        items: ["Tables", "RLS intro", "Protected pages"],
      },
    ],
  },
];

/* ================= Page ================= */

export default function CourseDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const course = COURSES.find((c) => c.id === params.id);
  if (!course) return notFound();

  return (
    <main className="container-page section-pad">
      {/* ===== Header ===== */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={
                course.priceLabel === "უფასო" ? "badge-success" : "badge"
              }
            >
              {course.priceLabel}
            </span>
            <span className="badge-info">დონე: {course.level}</span>
            <span className="badge">ხანგრძლივობა: {course.duration}</span>
            {course.locked ? (
              <span className="badge-warn">Locked</span>
            ) : (
              <span className="badge-success">Open</span>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white/95 md:text-3xl">
            {course.title}
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-white/70">
            {course.desc}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/courses" className="btn-secondary">
              ← ყველა კურსი
            </Link>

            <Link
              href={`/courses/${course.id}/learn`}
              className="btn-secondary"
            >
              Learn
            </Link>
          </div>
        </div>

        {/* ===== Preview Card ===== */}
        <aside className="card md:w-[360px]">
          <h2 className="text-lg font-semibold text-white/95">
            Public preview
          </h2>
          <p className="mt-2 text-sm text-white/70">
            სრული გაკვეთილები ხელმისაწვდომი გახდება ავტორიზაციისა და (შემდგომში)
            გადახდის შემდეგ.
          </p>
        </aside>
      </div>

      {/* ===== Content ===== */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="card">
          <h2 className="text-lg font-semibold text-white/95">
            რას ისწავლი
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            {course.outcomes.map((x) => (
              <li key={x}>• {x}</li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold text-white/95">
            სილაბუსი (Preview)
          </h2>

          <div className="mt-3 space-y-3">
            {course.syllabusPreview.map((m) => (
              <div
                key={m.title}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <p className="text-sm font-semibold text-white/90">
                  {m.title}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-white/70">
                  {m.items.map((it) => (
                    <li key={it}>- {it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== Bottom CTA ===== */}
      <div className="mt-10 card">
        <h3 className="text-lg font-semibold text-white/95">
          შემდეგი ნაბიჯი
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          სრულ კონტენტზე წვდომა გაიხსნება ავტორიზაციის შემდეგ.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {course.locked ? (
            <>
              <Link href="/auth/sign-in" className="btn-primary">
                შესვლა
              </Link>
              <Link href="/auth/sign-up" className="btn-secondary">
                რეგისტრაცია
              </Link>
            </>
          ) : (
            <Link href="/dashboard" className="btn-primary">
              დაწყება დეშბორდში
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
