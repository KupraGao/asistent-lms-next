import Link from "next/link";
import { notFound } from "next/navigation";

type Course = {
  id: string;
  title: string;
  locked: boolean;
};

const COURSES: Course[] = [
  { id: "c1", title: "Front-end საფუძვლები (HTML/CSS)", locked: false },
  { id: "c2", title: "JavaScript პრაქტიკა — DOM & ლოგიკა", locked: true },
  { id: "c3", title: "Next.js + Supabase — Auth & მონაცემები", locked: true },
];

export default function LearnPage({ params }: { params: { id: string } }) {
  const course = COURSES.find((c) => c.id === params.id);
  if (!course) return notFound();

  return (
    <main className="container-page section-pad">
      <div className="mx-auto max-w-3xl">
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs text-white/55">Learn Area</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white/95">
                {course.title}
              </h1>
            </div>

            <Link href={`/courses/${course.id}`} className="btn-secondary">
              ← Preview
            </Link>
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/70">
              ეს არის Learn სივრცის “Skeleton”. აქ იქნება გაკვეთილების სია, პროგრესი,
              და ლოქი/წვდომის კონტროლი.
            </p>
          </div>

          {course.locked ? (
            <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-500/10 p-4">
              <p className="text-sm font-semibold text-amber-100">კონტენტი ჩაკეტილია</p>
              <p className="mt-1 text-sm text-white/70">
                ახლა საჭიროა ავტორიზაცია. შემდეგ ეტაპზე დავამატებთ Payment gating-ს.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/auth/sign-in" className="btn-primary">
                  შესვლა
                </Link>
                <Link href="/auth/sign-up" className="btn-secondary">
                  რეგისტრაცია
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-500/10 p-4">
              <p className="text-sm font-semibold text-emerald-100">კონტენტი ხელმისაწვდომია</p>
              <p className="mt-1 text-sm text-white/70">
                ამ კურსზე Learn მოდული შემდეგ ეტაპზე გადავიტანოთ რეალურ გაკვეთილებზე.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/dashboard" className="btn-primary">
                  დეშბორდში გადასვლა
                </Link>
                <Link href="/courses" className="btn-secondary">
                  სხვა კურსები
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6 text-xs text-white/45">
            Next: (1) lessons data model, (2) progress, (3) auth guard, (4) payment gating.
          </div>
        </div>
      </div>
    </main>
  );
}
