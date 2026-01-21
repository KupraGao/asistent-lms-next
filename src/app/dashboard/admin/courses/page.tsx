import Link from "next/link";

export default function Page() {
  return (
    <main className="container-page section-pad">
      <div className="mb-4">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          ← ადმინის პანელზე დაბრუნება
        </Link>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/70">
        მალე დაემატება
      </div>
    </main>
  );
}
