"use client";

// =======================================================
// FILE: src/components/admin/AdminCoursesControls.tsx
// PURPOSE: Admin Courses controls (search + filter + sort)
// - Auto-submit on change (status/sort)
// - Search submit button
// NOTE: ეს არის Client Component, რადგან event handlers გვჭირდება.
// =======================================================

import Link from "next/link";

type Props = {
  q: string;
  status: "all" | "draft" | "published";
  sort: "updated_desc" | "updated_asc" | "title_asc";
};

function buildQuery(params: Record<string, string>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) usp.set(k, v);
  });
  const s = usp.toString();
  return s ? `?${s}` : "";
}

export default function AdminCoursesControls({ q, status, sort }: Props) {
  return (
    <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-12">
      {/* =========================
          SEARCH (GET)
          - ღილაკით ძიება
          - status/sort ინარჩუნებს მნიშვნელობას
         ========================= */}
      <form className="md:col-span-6" method="get">
        <label className="block text-xs font-semibold text-white/60">
          ძიება (სათაურით)
        </label>

        <div className="mt-2 flex gap-2">
          <input
            className="auth-input flex-1"
            name="q"
            defaultValue={q}
            placeholder="მაგ: Next.js, JavaScript..."
          />

          <input type="hidden" name="status" value={status === "all" ? "" : status} />
          <input type="hidden" name="sort" value={sort} />

          <button type="submit" className="btn-primary px-4">
            ძიება
          </button>
        </div>

        {(q || status !== "all" || sort !== "updated_desc") && (
          <div className="mt-2 text-xs text-white/60">
            <Link
              href="/dashboard/admin/courses"
              className="font-semibold text-white/75 hover:text-white/90"
            >
              ფილტრების გასუფთავება
            </Link>
          </div>
        )}
      </form>

      {/* =========================
          FILTER (status)
          - auto-submit: როგორც კი შეიცვლება, ფორმა იგზავნება
         ========================= */}
      <form className="md:col-span-3" method="get">
        <div className="text-xs font-semibold text-white/60">ფილტრი (სტატუსი)</div>

        {/* ვანარჩუნებთ დანარჩენ პარამეტრებს */}
        <input type="hidden" name="q" value={q} />
        <input type="hidden" name="sort" value={sort} />

        <select
          className="auth-input mt-2"
          name="status"
          defaultValue={status === "all" ? "" : status}
          aria-label="კურსის სტატუსის ფილტრი"
          title="კურსის სტატუსის ფილტრი"
          onChange={(e) => e.currentTarget.form?.submit()}
        >
          <option value="">ყველა</option>
          <option value="draft">დრაფტი</option>
          <option value="published">გამოქვეყნებული</option>
        </select>

        <p className="mt-2 text-xs text-white/50">
          * შეცვლისთანავე ავტომატურად გადააფილტრავს
        </p>
      </form>

      {/* =========================
          SORT
          - auto-submit: როგორც კი შეიცვლება, ფორმა იგზავნება
         ========================= */}
      <form className="md:col-span-3" method="get">
        <label className="block text-xs font-semibold text-white/60">სორტირება</label>

        {/* ვანარჩუნებთ დანარჩენ პარამეტრებს */}
        <input type="hidden" name="q" value={q} />
        <input type="hidden" name="status" value={status === "all" ? "" : status} />

        <select
          className="auth-input mt-2"
          name="sort"
          defaultValue={sort}
          aria-label="სორტირება"
          title="სორტირება"
          onChange={(e) => e.currentTarget.form?.submit()}
        >
          <option value="updated_desc">ბოლოს განახლებული</option>
          <option value="updated_asc">ძველი განახლებები</option>
          <option value="title_asc">სათაურით (A→Z)</option>
        </select>

        <p className="mt-2 text-xs text-white/50">
          * შეცვლისთანავე ავტომატურად გადალაგებს
        </p>
      </form>
    </div>
  );
}
