import Link from "next/link";

type Course = {
  id: string;
  title: string;
  desc: string;
  level: "დამწყები" | "საშუალო" | "გაღრმავებული";
  priceLabel: "უფასო" | "ფასიანი";
  locked: boolean;
  duration: string;
};

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

export default function CoursesPage() {
  return (
    <main className="container-page section-pad">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white/95 md:text-3xl">
            კურსები
          </h1>
          <p className="mt-1 text-sm text-white/70">
            გადახედე მიმოხილვას. სრულ კონტენტზე წვდომა გაიხსნება დეშბორდში.
          </p>
        </div>
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

            <h2 className="mt-4 text-lg font-semibold text-white/95">{c.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{c.desc}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="badge-info">დონე: {c.level}</span>
              {c.locked ? <span className="badge-warn">Locked</span> : <span className="badge-success">Open</span>}
            </div>

            <div className="mt-5 flex gap-2">
              <Link href={`/courses/${c.id}`} className="btn-secondary">
                დეტალები
              </Link>

              {c.locked ? (
                <Link href="/auth/sign-in" className="btn-primary">
                  შესვლა
                </Link>
              ) : (
                <Link href="/dashboard" className="btn-primary">
                  დაწყება
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 card">
        <h3 className="text-lg font-semibold text-white/95">
          როგორ მუშაობს “Public preview”?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          კურსის დეტალებში ხედავ მოკლე აღწერას, თემებს და რას ისწავლი. სრულ გაკვეთილებზე წვდომა
          შემდეგ ეტაპზე გაიხსნება Auth + Payment gating-ის შემდეგ.
        </p>
      </div>
      <div className="mt-8 card">
        <h3 className="text-lg font-semibold text-white/95">როგორ გაიხსნება სრული წვდომა?</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          საჯარო გვერდებზე ხედავ მოკლე მიმოხილვას. დეშბორდში (Auth-ის შემდეგ) შემდგომ ეტაპზე ჩავამატებთ:
          გადახდას/პაკეტებს და lesson access control-ს.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link className="btn-primary" href="/auth/sign-up">
            ანგარიშის შექმნა
          </Link>
          <Link className="btn-secondary" href="/contact">
            კითხვა გაქვს?
          </Link>
        </div>
      </div>
    </main>
  );
}
