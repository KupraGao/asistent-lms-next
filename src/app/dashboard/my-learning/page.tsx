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

            return (
              <Link
                key={c.id}
                href={`/dashboard/courses/${c.id}`}
                className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-medium">{c.title}</div>
                    <div className="mt-1 text-sm text-white/70">
                      სტატუსი: {c.status ?? "—"}
                    </div>
                  </div>

                  <div className="text-sm text-white/70">
                    {c.price_label ?? (c.price != null ? `${c.price}₾` : "Free")}
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