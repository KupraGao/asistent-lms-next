import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPurchasedCourses, enrollSelf } from "@/lib/db/enrollments";

export const dynamic = "force-dynamic";

type DevCourse = { id: string; title: string | null };

async function getDevCourses(): Promise<DevCourse[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("id, title")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];
  return data as DevCourse[];
}

export default async function MyLearningPage() {
  const rows = await getPurchasedCourses();

  // ✅ already enrolled course ids (to disable duplicates in DEV select)
  const enrolledIds = new Set(
    rows.map((r) => r.courses?.id).filter(Boolean) as string[]
  );

  // ✅ DEV-only courses list (only used when rows empty + dev mode)
  const isDev = process.env.NODE_ENV !== "production";
  const devCourses = rows.length === 0 && isDev ? await getDevCourses() : [];

  // ✅ pick the first course that is NOT already enrolled
  const firstAvailableCourseId =
    devCourses.find((c) => c.id && !enrolledIds.has(c.id))?.id ?? "";

  async function devEnrollAction(formData: FormData) {
    "use server";
    const courseId = String(formData.get("course_id") || "").trim();
    if (!courseId) return;

    try {
      await enrollSelf(courseId);
    } catch {
      // already enrolled / duplicate -> ignore
    }

    revalidatePath("/dashboard/my-learning");
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">ჩემი სწავლა</h1>

      {rows.length === 0 ? (
        <div className="mt-4">
          <p className="text-white/70">
            ჯერ არცერთი კურსი არ გაქვს შეძენილი/ჩაწერილი.
          </p>

          {/* ✅ DEV-only enroll helper */}
          {isDev && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-medium">
                DEV: სწრაფი ჩაწერა (Enroll)
              </div>
              <p className="mt-1 text-xs text-white/60">
                მხოლოდ development რეჟიმში ჩანს. აირჩიე კურსი და “ჩაწერა” დააჭირე,
                რომ ტესტისთვის დაგემატოს enrollment.
              </p>

              {devCourses.length === 0 ? (
                <p className="mt-3 text-sm text-white/70">
                  Courses ვერ წამოვიღე (ან ცხრილი ცარიელია).
                </p>
              ) : (
                <form action={devEnrollAction} className="mt-3 flex flex-wrap gap-2">
                  <select
                    name="course_id"
                    aria-label="აირჩიე კურსი (DEV enroll)"
                    className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"
                    defaultValue={firstAvailableCourseId}
                    required
                  >
                    <option value="" disabled>
                      აირჩიე კურსი…
                    </option>

                    {devCourses.map((c) => {
                      const title = c.title ?? c.id;
                      const already = enrolledIds.has(c.id);

                      return (
                        <option key={c.id} value={c.id} disabled={already}>
                          {already ? `✅ უკვე არჩეულია — ${title}` : title}
                        </option>
                      );
                    })}
                  </select>

                  <button
                    type="submit"
                    className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm hover:bg-white/15 disabled:opacity-50"
                    disabled={!firstAvailableCourseId}
                    title={!firstAvailableCourseId ? "ყველა კურსზე უკვე ჩაწერილი ხარ" : ""}
                  >
                    ჩაწერა (DEV)
                  </button>

                  {!firstAvailableCourseId && (
                    <div className="w-full text-xs text-white/60">
                      შენ უკვე ჩაწერილი ხარ ყველა ჩამოთვლილ კურსზე — აღარ არის ახალი
                      ასარჩევი.
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
        </div>
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