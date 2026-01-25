// =======================================================
// FILE: src/app/dashboard/courses/[id]/page.tsx
// PURPOSE: Shared Dashboard -> Course detail (admin + instructor)
// ACCESS:
//  - admin: ხედავს ნებისმიერ კურსს
//  - instructor: ხედავს მხოლოდ საკუთარ კურსს (author_id === user.id)
// NOTES:
//  - რესურსები (links/files) ჩანს აქაც
//  - ფაილებისთვის signed URL იქმნება render-ის დროს file_path-იდან
// =======================================================

import Link from "next/link";
import { redirect, notFound } from "next/navigation";
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

function formatBytes(n: number | null) {
  if (!n || n <= 0) return "";
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

export default async function DashboardCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1) Role guard
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");

  if (info.role !== "admin" && info.role !== "instructor") {
    redirect("/dashboard");
  }

  const { id } = await params;
  if (!id || id === "undefined") notFound();

  const supabase = await createClient();

  // 2) User (to enforce instructor ownership)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  // 3) Load course (admin sees all, instructor only own)
  let courseQuery = supabase
    .from("courses")
    .select("id,title,description,status,price,author_id,updated_at")
    .eq("id", id);

  if (info.role === "instructor") {
    courseQuery = courseQuery.eq("author_id", user.id);
  }

  const { data: course, error: courseErr } = await courseQuery.single<CourseRow>();

  if (courseErr || !course) return notFound();

  // 4) Load resources (links/files)
  const { data: resources, error: resErr } = await supabase
    .from("course_resources")
    .select("id,course_id,type,title,url,file_path,mime,size,created_at")
    .eq("course_id", id)
    .order("created_at", { ascending: false })
    .returns<ResourceRow[]>();

  const links = (resources ?? []).filter((r) => r.type === "link");
  const files = (resources ?? []).filter((r) => r.type === "file");

  // 5) Create signed URLs for files (render-time)
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

  const statusLabel = course.status === "published" ? "გამოქვეყნებული" : "დრაფტი";

  return (
    <main className="container-page section-pad">
      {/* ===== Top nav ===== */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href="/dashboard/my-courses"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          ← ჩემი კურსები
        </Link>

        <Link
          href="/dashboard"
          className="text-sm font-semibold text-white/70 hover:text-white/90"
        >
          დეშბორდი →
        </Link>
      </div>

      {/* ===== Header ===== */}
      <h1 className="text-2xl font-semibold text-white/95">{course.title}</h1>
      <p className="mt-2 text-sm text-white/70">
        სტატუსი: <span className="text-white/85">{statusLabel}</span>
        {" • "}
        ფასი:{" "}
        <span className="text-white/85">
          {course.price == null ? "უფასო" : `${course.price}`}
        </span>
      </p>

      {/* ===== Description ===== */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white/85">აღწერა</div>
        <div className="mt-2 whitespace-pre-wrap text-sm text-white/70">
          {course.description ?? "—"}
        </div>
      </div>

      {/* ===== Resources ===== */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-white/85">რესურსები (ლინკები)</div>

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

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-white/85">მასალები (ფაილები)</div>

          {files.length ? (
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              {files.map((r) => {
                const href = signedFileMap.get(r.id) || null;
                const label = r.title?.trim() || r.file_path || "ფაილი";

                const meta = [
                  r.mime ? r.mime : null,
                  typeof r.size === "number" ? formatBytes(r.size) : null,
                ]
                  .filter(Boolean)
                  .join(" • ");

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

                    {meta ? <div className="mt-0.5 text-xs text-white/50">{meta}</div> : null}
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

      {/* ===== Actions ===== */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/dashboard/courses/${course.id}/edit`}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          რედაქტირება
        </Link>

        {/* delete მოგვიანებით */}
        <button
          type="button"
          className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/15"
        >
          წაშლა
        </button>
      </div>
    </main>
  );
}
