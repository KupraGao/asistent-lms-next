"use client";

import Link from "next/link";

type Props = {
  q: string;
  status: "all" | "active" | "suspended";
  sort: "created_desc" | "created_asc" | "name_asc";
};

export default function AdminStudentsControls({ q, status, sort }: Props) {
  return (
    <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-12">
      {/* SEARCH */}
      <form className="md:col-span-6" method="get">
        <label className="block text-xs font-semibold text-white/60">ძიება</label>

        <div className="mt-2 flex gap-2">
          <input
            className="auth-input flex-1"
            name="q"
            defaultValue={q}
            placeholder="სახელი ან username..."
          />

          <input type="hidden" name="status" value={status === "all" ? "" : status} />
          <input type="hidden" name="sort" value={sort} />

          <button type="submit" className="btn-primary px-4">
            ძიება
          </button>
        </div>

        {(q || status !== "all" || sort !== "created_desc") && (
          <div className="mt-2 text-xs text-white/60">
            <Link
              href="/dashboard/admin/students"
              className="font-semibold text-white/75 hover:text-white/90"
            >
              ფილტრების გასუფთავება
            </Link>
          </div>
        )}
      </form>

      {/* STATUS FILTER (auto-submit) */}
      <form className="md:col-span-3" method="get">
        <div className="text-xs font-semibold text-white/60">სტატუსი</div>
        <input type="hidden" name="q" value={q} />
        <input type="hidden" name="sort" value={sort} />

        <select
          className="auth-input mt-2"
          name="status"
          defaultValue={status === "all" ? "" : status}
          aria-label="სტუდენტის სტატუსი"
          title="სტუდენტის სტატუსი"
          onChange={(e) => e.currentTarget.form?.submit()}
        >
          <option value="">ყველა</option>
          <option value="active">აქტიური</option>
          <option value="suspended">სუსპენდირებული</option>
        </select>
      </form>

      {/* SORT (auto-submit) */}
      <form className="md:col-span-3" method="get">
        <label className="block text-xs font-semibold text-white/60">სორტირება</label>
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
          <option value="created_desc">ახალი → ძველი</option>
          <option value="created_asc">ძველი → ახალი</option>
          <option value="name_asc">სახელით (A→Z)</option>
        </select>
      </form>
    </div>
  );
}
