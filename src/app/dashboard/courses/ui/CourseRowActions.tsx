"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
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
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const nextStatus = status === "published" ? "draft" : "published";

  // instructor/student UI: open + edit
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

      {/* ✅ Toggle publish/draft — refresh without manual page reload */}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const fd = new FormData();
            fd.set("courseId", courseId);
            fd.set("nextStatus", nextStatus);

            await togglePublishAction(fd);

            // ✅ აი ეს აგვარებს პრობლემას: RSC თავიდან წაიკითხავს და სტატუსი შეიცვლება
            router.refresh();
          });
        }}
        className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 disabled:opacity-60"
      >
        {pending
          ? "..."
          : status === "published"
          ? "დრაფტად გადაყვანა"
          : "გამოქვეყნება"}
      </button>

      {/* Delete 그대로 დავტოვე */}
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
