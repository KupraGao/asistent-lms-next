"use client";

import Link from "next/link";
import { deleteCourseAction, togglePublishAction } from "../actions";

export default function CourseRowActions({
  courseId,
  status,
  canManage,
}: {
  courseId: string;
  status: "draft" | "published";
  canManage: boolean;
}) {
  const nextStatus = status === "published" ? "draft" : "published";

  // instructor-სთვის UI უბრალოდ edit link-ით შემოვიფარგლოთ (ან საერთოდ დავმალოთ)
  // შენ თქვი: admin-ს უნდა მართვა; ამიტომ canManage=false-ზე მხოლოდ "გახსნა" / "რედაქტირება" შეგვიძლია.
  if (!canManage) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10"
        >
          გახსნა
        </Link>

        <Link
          href={`/dashboard/courses/${courseId}/edit`}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10"
        >
          რედაქტირება
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/dashboard/courses/${courseId}/edit`}
        className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-white/90"
      >
        რედაქტირება
      </Link>

      <form action={togglePublishAction}>
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="nextStatus" value={nextStatus} />
        <button
          type="submit"
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10"
        >
          {status === "published" ? "დრაფტად გადაყვანა" : "გამოქვეყნება"}
        </button>
      </form>

      <form
        action={deleteCourseAction}
        onSubmit={(e) => {
          if (!confirm("ნამდვილად გინდა კურსის წაშლა?")) e.preventDefault();
        }}
      >
        <input type="hidden" name="courseId" value={courseId} />
        <button
          type="submit"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/15"
        >
          წაშლა
        </button>
      </form>
    </div>
  );
}
