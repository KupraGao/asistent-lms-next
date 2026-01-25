// =======================================================
// FILE: src/app/dashboard/admin/courses/[id]/edit/page.tsx
// PURPOSE: Admin -> Edit course (MVP)
// ACCESS: მხოლოდ admin
// =======================================================

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { updateCourseAction } from "./actions";

type CourseRow = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published";
  price: number | null;
  updated_at: string | null;
};

export default async function AdminCourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");
  if (info.role !== "admin") redirect("/dashboard");

  const { id } = await params;
  if (!id || id === "undefined") redirect("/dashboard/admin/courses");

  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select("id, title, description, status, price, updated_at")
    .eq("id", id)
    .single<CourseRow>();

  if (error || !course) redirect("/dashboard/admin/courses");

  return (
    <main className="container-page section-pad">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href={`/dashboard/admin/courses/${course.id}`}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          ← უკან (კურსი)
        </Link>

        <Link
          href="/dashboard/admin/courses"
          className="text-sm font-semibold text-white/70 hover:text-white/90"
        >
          ყველა კურსი →
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-white/95">კურსის რედაქტირება</h1>

      <form
        action={updateCourseAction}
        className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <input type="hidden" name="id" value={course.id} />

        <label
          htmlFor="title"
          className="block text-sm font-semibold text-white/85"
        >
          სათაური
        </label>
        <input
          id="title"
          name="title"
          defaultValue={course.title}
          required
          className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white outline-none"
        />

        <label
          htmlFor="description"
          className="mt-4 block text-sm font-semibold text-white/85"
        >
          აღწერა
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={course.description ?? ""}
          rows={6}
          className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white outline-none"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-semibold text-white/85"
            >
              სტატუსი
            </label>
            <select
              id="status"
              name="status"
              defaultValue={course.status}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="draft">დრაფტი</option>
              <option value="published">გამოქვეყნებული</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-semibold text-white/85"
            >
              ფასი (ცარიელი = უფასო)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step="1"
              defaultValue={course.price ?? ""}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white outline-none"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            შენახვა
          </button>

          <Link
            href={`/dashboard/admin/courses/${course.id}`}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            გაუქმება
          </Link>
        </div>
      </form>
    </main>
  );
}
