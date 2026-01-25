// =======================================================
// FILE: src/app/dashboard/my-courses/page.tsx
// PURPOSE: My Courses (admin/instructor) — მხოლოდ ჩემი შექმნილი კურსები
// NOTES:
// - ქარდი აღარ არის clickable მთლიანად
// - "რედაქტირება" არის ცალკე ღილაკი -> /dashboard/courses/[id]/edit
// =======================================================

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type CourseRow = {
  id: string;
  title: string | null;
  status: "draft" | "published" | null;
  price: number | null;
  updated_at: string | null;
};

export default async function MyCoursesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  // ჩემი შექმნილი კურსები (author_id = მიმდინარე user)
  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title, status, price, updated_at")
    .eq("author_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <main className="container-page section-pad">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white/95">ჩემი კურსები</h1>
          <p className="mt-2 text-sm text-white/70">
            აქ ჩანს ყველა კურსი, რომელიც შენ შექმენი (დრაფტი და გამოქვეყნებული).
          </p>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          კურსების ჩატვირთვა ვერ მოხერხდა: {error.message}
        </div>
      ) : null}

      {/* List */}
      <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
        {(courses ?? []).map((c: CourseRow) => {
          const title = c.title?.trim() || "უსათაურო კურსი";
          const statusLabel =
            c.status === "published" ? "გამოქვეყნებული" : "დრაფტი";
          const priceLabel = c.price == null ? "უფასო" : `ფასი: ${c.price}`;
          const updated = c.updated_at ?? "—";

          return (
            <div
              key={c.id}
              className="flex flex-col gap-2 p-4 hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white/90">
                  {title}
                </div>
                <div className="mt-1 text-xs text-white/55">
                  {priceLabel} • განახლდა: {updated}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/75">
                  {statusLabel}
                </span>
<Link
  href={`/dashboard/courses/${c.id}/edit`}
  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
>
  რედაქტირება
</Link>

              </div>
            </div>
          );
        })}

        {(courses?.length ?? 0) === 0 ? (
          <div className="p-4 text-sm text-white/60">
            ჯერ კურსები არ გაქვს შექმნილი.
          </div>
        ) : null}
      </div>

      <p className="mt-4 text-xs text-white/50">
        * “რედაქტირება” ღილაკით გადადიხარ კურსის ცვლილებაზე: შინაარსი, ფასი,
        სტატუსი.
      </p>
    </main>
  );
}
