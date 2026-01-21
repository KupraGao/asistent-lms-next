// src/app/dashboard/my-learning/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MyLearningPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  return (
    <main className="container-page section-pad">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white/95">ჩემი შეძენილი კურსები</h1>
          <p className="mt-2 text-sm text-white/70">
            აქ გამოჩნდება კურსები, რომლებშიც ჩარიცხული ხარ (მიმდინარე/დასრულებული).
          </p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          ← დეშბორდი
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        მალე დაემატება (enrollments ცხრილის ჩადგმის შემდეგ).
      </div>
    </main>
  );
}
