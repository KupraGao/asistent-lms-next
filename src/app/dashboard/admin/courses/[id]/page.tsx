// =======================================================
// FILE: src/app/dashboard/admin/courses/[id]/page.tsx
// PURPOSE: Admin -> Course detail (MVP)
// ACCESS: მხოლოდ admin
// =======================================================

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";

type CourseRow = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published";
  price: number | null;
  author_id: string;
  updated_at: string | null;
};

export default async function AdminCourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // =========================
  // 1) Role guard
  // =========================
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");
  if (info.role !== "admin") redirect("/dashboard");

  const { id } = params;

  // =========================
  // 2) Load course
  // =========================
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select("id, title, description, status, price, author_id, updated_at")
    .eq("id", id)
    .single<CourseRow>();

  if (error || !course) {
    return (
      <main className="container-page section-pad">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/admin/courses"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            ← ყველა კურსი
          </Link>

          <Link
            href="/dashboard/admin"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            ადმინის პანელი
          </Link>
        </div>

        <p className="mt-4 text-sm text-red-200">კურსი ვერ მოიძებნა.</p>
      </main>
    );
  }

  const statusLabel = course.status === "published" ? "გამოქვეყნებული" : "დრაფტი";

  return (
    <main className="container-page section-pad">
      {/* =========================
          Top nav
         ========================= */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href="/dashboard/admin/courses"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          ← ყველა კურსი
        </Link>

        <Link
          href="/dashboard/admin"
          className="text-sm font-semibold text-white/70 hover:text-white/90"
        >
          ადმინის პანელი →
        </Link>
      </div>

      {/* =========================
          Header
         ========================= */}
      <h1 className="text-2xl font-semibold text-white/95">{course.title}</h1>
      <p className="mt-2 text-sm text-white/70">
        სტატუსი: <span className="text-white/85">{statusLabel}</span>
        {" • "}
        ფასი:{" "}
        <span className="text-white/85">
          {course.price == null ? "უფასო" : `${course.price}`}
        </span>
      </p>

      {/* =========================
          Description
         ========================= */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white/85">აღწერა</div>
        <div className="mt-2 text-sm text-white/70 whitespace-pre-wrap">
          {course.description ?? "—"}
        </div>
      </div>

      {/* =========================
          Placeholder actions
         ========================= */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          რედაქტირება (მალე)
        </button>

        <button
          type="button"
          className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/15"
        >
          წაშლა (მალე)
        </button>
      </div>

      <p className="mt-3 text-xs text-white/50">
        * შემდეგ ეტაპზე აქ დაემატება: ავტორი (instructor), enrolled სტუდენტები,
        ფაილები/ლექციები და სტატუსის შეცვლა.
      </p>
    </main>
  );
}
