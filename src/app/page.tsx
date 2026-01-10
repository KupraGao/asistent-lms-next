import Link from "next/link";

/* ================= Types ================= */

type Course = {
  id: string;
  title: string;
  desc: string;
  level: "დამწყები" | "საშუალო" | "გაღრმავებული";
  priceLabel: "უფასო" | "ფასიანი";
  locked: boolean;
  duration: string;
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
  },
  {
    id: "c2",
    title: "JavaScript პრაქტიკა — DOM & ლოგიკა",
    desc: "სავარჯიშოები რეალური UI ამოცანებით: events, state, ფორმები.",
    level: "საშუალო",
    priceLabel: "ფასიანი",
    locked: true,
    duration: "4 კვირა",
  },
  {
    id: "c3",
    title: "Next.js + Supabase — Auth & მონაცემები",
    desc: "ავტორიზაცია, როლები, მონაცემთა მოდელი და დაცვა.",
    level: "გაღრმავებული",
    priceLabel: "ფასიანი",
    locked: true,
    duration: "6 კვირა",
  },
];

/* ================= UI Components ================= */

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="btn-primary group">
      {children}
      <span className="transition group-hover:translate-x-0.5">→</span>
    </Link>
  );
}

function SecondaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="btn-secondary">
      {children}
    </Link>
  );
}

/* ================= Page ================= */

export default function HomePage() {
  return (
    <main className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      {/* ===== Hero ===== */}
      <section className="border-b border-white/10">
        <div className="container-page section-pad">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            {/* Left */}
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="badge-info">აკადემიური სტრუქტურა</span>
                <span className="badge-success">პრაქტიკული დავალებები</span>
                <span className="badge">Progress tracking</span>
              </div>

              {/* ✅ Smaller headline (as requested) */}
              <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-4xl">
                ონლაინ სასწავლო პლატფორმა
                <span className="block bg-gradient-to-r from-indigo-300 to-sky-300 bg-clip-text text-transparent pb-2">
                  თანამედროვე უნარებისთვის
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
                კურსები მკაფიო სტრუქტურით, პრაქტიკული დავალებებით და პროგრესის
                კონტროლით.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <PrimaryButton href="/courses">კურსების ნახვა</PrimaryButton>
                <SecondaryButton href="/auth/sign-up">დაიწყე სწავლა</SecondaryButton>
              </div>
            </div>

            {/* Right */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white/95">
                როგორ მუშაობს სისტემა
              </h2>

              <ol className="mt-4 space-y-3 text-sm">
                <li className="card">
                  <strong className="text-white/95">1) რეგისტრაცია</strong>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">
                    შექმენი ანგარიში და მიიღე წვდომა კაბინეტზე.
                  </p>
                </li>
                <li className="card">
                  <strong className="text-white/95">2) კურსის არჩევა</strong>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">
                    ნახე პროგრამა და დონე.
                  </p>
                </li>
                <li className="card">
                  <strong className="text-white/95">3) სწავლა</strong>
                  <p className="mt-1 text-sm leading-relaxed text-white/70">
                    გაკვეთილები და პროგრესის კონტროლი.
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Courses ===== */}
      <section>
        <div className="container-page section-pad">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white/95">
                კურსების მიმოხილვა
              </h2>
              <p className="mt-1 text-sm text-white/70">
                სრულ შინაარსზე წვდომა გაიხსნება პირად კაბინეტში.
              </p>
            </div>

            <Link href="/courses" className="link-soft">
              ყველა კურსი →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {COURSES.map((c) => (
              <div key={c.id} className="card">
                <div className="flex items-center justify-between text-xs">
                  <span className={c.priceLabel === "უფასო" ? "badge-success" : "badge"}>
                    {c.priceLabel}
                  </span>
                  <span className="text-white/60">{c.duration}</span>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-white/95">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  {c.desc}
                </p>

                <div className="mt-5 flex gap-2">
                  <Link href="/courses" className="btn-secondary">
                    დეტალები
                  </Link>

                  {c.locked ? (
                    <Link href="/auth/sign-in" className="btn-primary">
                      შესვლა
                    </Link>
                  ) : (
                    <Link href="/courses" className="btn-primary">
                      დაწყება
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
