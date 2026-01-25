import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type CourseLevel = "დამწყები" | "საშუალო" | "გაღრმავებული";
type PriceLabel = "უფასო" | "ფასიანი";

type CourseRow = {
  id: string;
  title: string;
  description: string | null;

  status: "draft" | "published" | null;

  price: number | null;
  price_label: PriceLabel | null;

  duration: string | null;
  level: CourseLevel | null;

  locked: boolean | null;

  updated_at: string | null;
};

function normalizeLevel(v: string | null): CourseLevel {
  if (v === "საშუალო" || v === "გაღრმავებული" || v === "დამწყები") return v;
  return "დამწყები";
}

function normalizePriceLabel(v: string | null): PriceLabel {
  if (v === "ფასიანი" || v === "უფასო") return v;
  return "უფასო";
}

export default async function CoursesPage() {
  const supabase = await createClient();

  // Public preview: only published
  const { data, error } = await supabase
    .from("courses")
    .select(
      "id,title,description,status,price,price_label,duration,level,locked,updated_at"
    )
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .returns<CourseRow[]>();

  const courses = (data ?? []).map((c) => {
    const priceLabel = normalizePriceLabel(c.price_label);
    const level = normalizeLevel(c.level);

    // locked: თუ null-ია, ჩავთვალოთ true (უსაფრთხო default)
    const locked = typeof c.locked === "boolean" ? c.locked : true;

    // duration: თუ ცარიელია, ვაჩვენოთ "-"
    const duration = (c.duration ?? "").trim() || "—";

    // desc: ბარათზე მოკლე ტექსტად
    const desc = (c.description ?? "").trim();

    return {
      id: c.id,
      title: c.title,
      desc,
      level,
      priceLabel,
      locked,
      duration,
      price: c.price,
    };
  });

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

      {/* Error block (dev-friendly) */}
      {error ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-red-200">
          {error.message}
        </div>
      ) : null}

      {/* Empty state */}
      {!error && courses.length === 0 ? (
        <div className="mt-6 card p-5">
          <h3 className="text-lg font-semibold text-white/95">ჯერ კურსი არ გამოქვეყნებულა</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Public გვერდზე ჩანს მხოლოდ <span className="text-white/85">published</span> სტატუსის კურსები.
            თუ ახლა შექმენი კურსი და არის <span className="text-white/85">draft</span>, ჯერ გამოაქვეყნე.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="btn-primary" href="/auth/sign-in">
              შესვლა
            </Link>
            <Link className="btn-secondary" href="/contact">
              კითხვა გაქვს?
            </Link>
          </div>
        </div>
      ) : null}

      {/* Grid */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {courses.map((c) => (
          <div key={c.id} className="card">
            <div className="flex items-center justify-between text-xs">
              <span className={c.priceLabel === "უფასო" ? "badge-success" : "badge"}>
                {c.priceLabel}
              </span>
              <span className="text-white/60">{c.duration}</span>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-white/95">{c.title}</h2>

            {c.desc ? (
              <p className="mt-2 text-sm leading-relaxed text-white/70">{c.desc}</p>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                მოკლე აღწერა დამატებული არ არის.
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="badge-info">დონე: {c.level}</span>
              {c.locked ? (
                <span className="badge-warn">Locked</span>
              ) : (
                <span className="badge-success">Open</span>
              )}
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
