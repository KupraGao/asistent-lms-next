import Link from "next/link";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
/* ================= Types ================= */
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
type CourseCard = {
id: string;
title: string;
desc: string;
level: CourseLevel;
priceLabel: PriceLabel;
locked: boolean;
duration: string;
};
function normalizeLevel(v: string | null): CourseLevel {
if (v === "საშუალო" || v === "გაღრმავებული" || v === "დამწყები") return v;
return "დამწყები";
}
function normalizePriceLabel(v: string | null): PriceLabel {
if (v === "ფასიანი" || v === "უფასო") return v;
return "უფასო";
}
/* ================= UI Components ================= */
function PrimaryButton({ href, children }: { href: string; children: ReactNode }) {
return (
<Link href={href} className="btn-primary group">
{children}
<span className="transition group-hover:translate-x-0.5">→</span>
</Link>
);
}
function SecondaryButton({ href, children }: { href: string; children: ReactNode }) {
return (
<Link href={href} className="btn-secondary">
{children}
</Link>
);
}
/* ================= Page ================= */
export default async function HomePage() {
const supabase = await createClient();
// Home preview: latest 3 published courses
const { data, error } = await supabase
.from("courses")
.select("id,title,description,status,price,price_label,duration,level,locked,updated_at")
.eq("status", "published")
.order("updated_at", { ascending: false })
.limit(3)
.returns<CourseRow[]>();
const COURSES: CourseCard[] = (data ?? []).map((c) => {
const priceLabel = normalizePriceLabel(c.price_label);
const level = normalizeLevel(c.level);
const locked = typeof c.locked === "boolean" ? c.locked : true;
const duration = (c.duration ?? "").trim() || "—";
const desc = (c.description ?? "").trim();
return {
id: c.id,
title: c.title,
desc,
level,
priceLabel,
locked,
duration,
};
});
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
               <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-4xl">
                  ონლაინ სასწავლო პლატფორმა
                  <span className="block bg-linear-to-r from-indigo-300 to-sky-300 bg-clip-text pb-2 text-transparent">
                  თანამედროვე უნარებისთვის
                  </span>
               </h1>
               <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70">
                  კურსები მკაფიო სტრუქტურით, პრაქტიკული დავალებებით და პროგრესის კონტროლით.
               </p>
               <div className="mt-7 flex flex-wrap gap-3">
                  <PrimaryButton href="/courses">კურსების ნახვა</PrimaryButton>
                  <SecondaryButton href="/auth/sign-up">დაიწყე სწავლა</SecondaryButton>
               </div>
            </div>
            {/* Right */}
            <div className="card">
               <h2 className="text-lg font-semibold text-white/95">როგორ მუშაობს სისტემა</h2>
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
         {error ? (
         <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-red-200">
            {error.message}
         </div>
         ) : null}
         {(!error && COURSES.length === 0) ? (
         <div className="mt-6 card p-5">
            <h3 className="text-lg font-semibold text-white/95">ჯერ კურსი არ გამოქვეყნებულა</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
               მთავარ გვერდზე და საჯარო კურსების გვერდზე ჩანს მხოლოდ{" "}
               <span className="text-white/85">published</span> კურსები.
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
         <div className="mt-6 grid gap-4 md:grid-cols-3">
            {COURSES.map((c) => (
            <div key={c.id} className="card">
               <div className="flex items-center justify-between text-xs">
                  <span className={c.priceLabel === "უფასო" ? "badge-success" : "badge"}>
                  {c.priceLabel}
                  </span>
                  <span className="text-white/60">{c.duration}</span>
               </div>
               <h3 className="mt-4 text-lg font-semibold text-white/95">{c.title}</h3>
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
      </div>
   </section>
</main>
);
}