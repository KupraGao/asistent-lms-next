import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  audience: string | null;
  outcomes: string[] | null;
  topics: string[] | null;
  requirements: string[] | null;
};

type ResourceRow = {
  id: string;
  course_id: string;
  type: "link" | "file";
  title: string | null;
  url: string;
  file_path: string | null;
  mime: string | null;
  size: number | null;
  created_at: string | null;
};

function normalizeLevel(v: string | null): CourseLevel {
  if (v === "საშუალო" || v === "გაღრმავებული" || v === "დამწყები") return v;
  return "დამწყები";
}

function normalizePriceLabel(v: string | null): PriceLabel {
  if (v === "ფასიანი" || v === "უფასო") return v;
  return "უფასო";
}

function asArray(v: string[] | null | undefined) {
  return Array.isArray(v) ? v : [];
}

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  // Public preview: show only published courses
  const { data: course, error } = await supabase
    .from("courses")
    .select(
      "id,title,description,status,price,price_label,duration,level,locked,audience,outcomes,topics,requirements"
    )
    .eq("id", id)
    .eq("status", "published")
    .single<CourseRow>();

  if (error || !course) return notFound();

  // Resources (links/files)
  const { data: resources, error: resErr } = await supabase
    .from("course_resources")
    .select("id,course_id,type,title,url,file_path,mime,size,created_at")
    .eq("course_id", id)
    .order("created_at", { ascending: false })
    .returns<ResourceRow[]>();

  const priceLabel = normalizePriceLabel(course.price_label);
  const level = normalizeLevel(course.level);
  const locked = typeof course.locked === "boolean" ? course.locked : true;
  const duration = (course.duration ?? "").trim() || "—";

  const audience = (course.audience ?? "").trim();
  const outcomes = asArray(course.outcomes);
  const topics = asArray(course.topics);
  const requirements = asArray(course.requirements);

  const links = (resources ?? []).filter((r) => r.type === "link");
  const files = (resources ?? []).filter((r) => r.type === "file");

  // ✅ Create signed URLs at render-time (so links won't expire in DB)
  // Map: resource_id -> signedUrl
  const signedFileMap = new Map<string, string>();

  await Promise.all(
    files.map(async (r) => {
      if (!r.file_path) return;

      const { data: signed, error: signErr } = await supabase.storage
        .from("course-assets")
        .createSignedUrl(r.file_path, 60 * 30); // 30 minutes

      if (!signErr && signed?.signedUrl) {
        signedFileMap.set(r.id, signed.signedUrl);
      }
    })
  );

  const hasResources = links.length > 0 || files.length > 0 || !!resErr;

  return (
    <main className="container-page section-pad">
      {/* ===== Header ===== */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={priceLabel === "უფასო" ? "badge-success" : "badge"}>
              {priceLabel}
            </span>

            <span className="badge-info">დონე: {level}</span>
            <span className="badge">ხანგრძლივობა: {duration}</span>

            {locked ? (
              <span className="badge-warn">Locked</span>
            ) : (
              <span className="badge-success">Open</span>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white/95 md:text-3xl">
            {course.title}
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-white/70">
            {(course.description ?? "").trim() ||
              "მოკლე აღწერა დამატებული არ არის."}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/courses" className="btn-secondary">
              ← ყველა კურსი
            </Link>

            {locked ? (
              <Link href="/auth/sign-in" className="btn-primary">
                შესვლა
              </Link>
            ) : (
              <Link href="/dashboard" className="btn-primary">
                დაწყება დეშბორდში
              </Link>
            )}
          </div>
        </div>

        {/* ===== Preview Card ===== */}
        <aside className="card md:w-[360px]">
          <h2 className="text-lg font-semibold text-white/95">Public preview</h2>
          <p className="mt-2 text-sm text-white/70">
            სრული გაკვეთილები ხელმისაწვდომი გახდება ავტორიზაციისა და (შემდგომში)
            გადახდის შემდეგ.
          </p>

          {priceLabel === "ფასიანი" ? (
            <p className="mt-3 text-sm text-white/75">
              ფასი:{" "}
              <span className="text-white/90">{course.price ?? "—"}</span>
            </p>
          ) : null}
        </aside>
      </div>

      {/* ===== Content ===== */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="card">
          <h2 className="text-lg font-semibold text-white/95">ვისთვისაა კურსი</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            {audience || "ჯერ არ არის შევსებული."}
          </p>
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold text-white/95">რას ისწავლი</h2>
          {outcomes.length ? (
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              {outcomes.map((x) => (
                <li key={x}>• {x}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-white/70">ჯერ არ არის შევსებული.</p>
          )}
        </section>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="card">
          <h2 className="text-lg font-semibold text-white/95">თემები / სილაბუსი</h2>
          {topics.length ? (
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              {topics.map((x) => (
                <li key={x}>• {x}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-white/70">ჯერ არ არის შევსებული.</p>
          )}
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold text-white/95">წინაპირობები</h2>
          {requirements.length ? (
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              {requirements.map((x) => (
                <li key={x}>• {x}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-white/70">
              არ არის აუცილებელი (ან არ არის შევსებული).
            </p>
          )}
        </section>
      </div>

      {/* ===== Resources ===== */}
      {hasResources ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="card">
            <h2 className="text-lg font-semibold text-white/95">რესურსები (ლინკები)</h2>

            {links.length ? (
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {links.map((r) => (
                  <li key={r.id} className="wrap-break-word">
                    •{" "}
                    <a
                      className="underline underline-offset-4 hover:text-white"
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {r.title?.trim() || r.url}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-white/70">ლინკები არ არის დამატებული.</p>
            )}
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold text-white/95">მასალები (ფაილები)</h2>

            {files.length ? (
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {files.map((r) => {
                  const href = signedFileMap.get(r.id) || null;
                  const label = r.title?.trim() || r.file_path || "ფაილი";

                  return (
                    <li key={r.id} className="wrap-break-word">
                      •{" "}
                      {href ? (
                        <a
                          className="underline underline-offset-4 hover:text-white"
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {label}
                        </a>
                      ) : (
                        <span className="text-white/60">
                          {label}{" "}
                          <span className="text-xs text-white/40">
                            (ლინკი ვერ შეიქმნა)
                          </span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-white/70">ფაილები არ არის დამატებული.</p>
            )}

            {resErr ? (
              <p className="mt-3 text-xs text-red-200">
                რესურსების წაკითხვა ვერ მოხერხდა: {resErr.message}
              </p>
            ) : null}
          </section>
        </div>
      ) : null}

      {/* ===== Bottom CTA ===== */}
      <div className="mt-10 card">
        <h3 className="text-lg font-semibold text-white/95">შემდეგი ნაბიჯი</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          სრულ კონტენტზე წვდომა გაიხსნება ავტორიზაციის შემდეგ.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {locked ? (
            <>
              <Link href="/auth/sign-in" className="btn-primary">
                შესვლა
              </Link>
              <Link href="/auth/sign-up" className="btn-secondary">
                რეგისტრაცია
              </Link>
            </>
          ) : (
            <Link href="/dashboard" className="btn-primary">
              დაწყება დეშბორდში
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
