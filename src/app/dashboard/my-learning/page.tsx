import Link from "next/link";
import { getPurchasedCourses } from "@/lib/db/enrollments";

export const dynamic = "force-dynamic";

export default async function MyLearningPage() {
  const rows = await getPurchasedCourses();

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">ჩემი სწავლა</h1>

      {rows.length === 0 ? (
        <p className="mt-4 text-white/70">
          ჯერ არცერთი კურსი არ გაქვს შეძენილი/ჩაწერილი.
        </p>
      ) : (
        <div className="mt-4 grid gap-3">
          {rows.map((r) => {
            const c = r.courses;
            if (!c) return null;

            // ✅ eslint-safe + browser-safe: 10%-იანი ნაბიჯები
            const progressStep = Math.min(
              100,
              Math.max(0, Math.round((r.progress ?? 0) / 10) * 10)
            );

            const href = r.last_lesson_id
              ? `/courses/${c.id}/learn?lesson=${encodeURIComponent(
                  r.last_lesson_id
                )}`
              : `/courses/${c.id}/learn`;

            return (
              <Link
                key={c.id}
                href={href}
                className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base font-medium">{c.title}</div>

                    <div className="mt-1 text-sm text-white/70">
                      სტატუსი: {c.status ?? "—"}
                    </div>

                    {/* ✅ Progress UI */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span>პროგრესი</span>
                        <span>{r.progress ?? 0}%</span>
                      </div>

                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full bg-white/40 progress-${progressStep}`}
                        />
                      </div>

                      <div className="mt-2 text-xs text-white/60">
                        {r.last_lesson_id
                          ? "გაგრძელდება ბოლო გაკვეთილიდან"
                          : "გაგრძელება დაიწყება თავიდან"}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-sm text-white/70">
                      {c.price_label ?? (c.price != null ? `${c.price}₾` : "Free")}
                    </div>

                    <div className="mt-2 inline-flex rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                      გაგრძელება →
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}