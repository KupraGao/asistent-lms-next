// =======================================================
// FILE: src/app/dashboard/my-courses/page.tsx
// PURPOSE: My Courses (admin/instructor) — მხოლოდ ჩემი შექმნილი კურსები
// NOTES:
// - UI სტრუქტურა იგივეა რაც /dashboard/courses (row layout + actions right)
// - აქ ავტორი არ გვჭირდება, რადგან ყველა კურსი ჩემია
// =======================================================

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import CourseRowActions from "../courses/ui/CourseRowActions";

export const dynamic = "force-dynamic";

type CourseStatus = "draft" | "published";

type CourseRow = {
  id: string;
  title: string | null;
  status: CourseStatus | null;
  price: number | null;
  updated_at: string | null;
};

function formatUpdatedAt(v: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("ka-GE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function MyCoursesPage() {
  // -----------------------------
  // 1) Role guard
  // -----------------------------
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");

  if (info.role !== "admin" && info.role !== "instructor") {
    redirect("/dashboard?error=" + encodeURIComponent("წვდომა არ გაქვს."));
  }

  // -----------------------------
  // 2) Auth
  // -----------------------------
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  // -----------------------------
  // 3) Query (only my courses)
  // -----------------------------
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, status, price, updated_at")
    .eq("author_id", user.id)
    .order("updated_at", { ascending: false })
    .returns<CourseRow[]>();

  const courses = data ?? [];

  // -----------------------------
  // 4) UI
  // -----------------------------
  return (
    <main className="container-page section-pad">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white/95">ჩემი კურსები</h1>
          <p className="mt-2 text-sm text-white/70">
            აქ ჩანს ყველა კურსი, რომელიც შენ შექმენი (დრაფტი და გამოქვეყნებული).
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          კურსების ჩატვირთვა ვერ მოხერხდა: {error.message}
        </div>
      ) : null}

      <div className="mt-6 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5">
        {courses.length === 0 ? (
          <div className="p-5 text-sm text-white/60">ჯერ კურსები არ გაქვს შექმნილი.</div>
        ) : (
          courses.map((c) => {
            const title = c.title?.trim() || "უსათაურო კურსი";
            const status: CourseStatus = c.status === "published" ? "published" : "draft";

            const statusLabel = status === "published" ? "გამოქვეყნებული" : "დრაფტი";
            const priceLabel = c.price == null ? "უფასო" : `ფასი: ${c.price}`;
            const updatedLabel = formatUpdatedAt(c.updated_at);

            return (
              <div
                key={c.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* LEFT */}
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/courses/${c.id}`}
                    className="block truncate text-sm font-semibold text-white/90 hover:text-white"
                    title={title}
                  >
                    {title}
                  </Link>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/55">
                    <span className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/75">
                      {statusLabel}
                    </span>

                    <span className="text-white/55">განახლდა: {updatedLabel}</span>

                    <span className="text-white/55">{priceLabel}</span>
                  </div>
                </div>

                {/* RIGHT */}
                <CourseRowActions courseId={c.id} status={status} canManage={true} />
              </div>
            );
          })
        )}
      </div>

      <p className="mt-4 text-xs text-white/50">
        * აქვე შეგიძლია: რედაქტირება, დრაფტი/გამოქვეყნება, წაშლა.
      </p>
    </main>
  );
}
