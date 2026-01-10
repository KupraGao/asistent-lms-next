import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/auth/actions";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/auth/sign-in?error=" +
        encodeURIComponent("გთხოვ ჯერ შეხვიდე სისტემაში.")
    );
  }

  return (
    <main className="container-page section-pad">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white/95 md:text-3xl">
            პირადი კაბინეტი
          </h1>
          <p className="mt-1 text-sm text-white/70">
            აქედან მართავ შენს კურსებს, პროგრესს და პარამეტრებს.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/courses" className="btn-secondary">
            კურსები
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="btn-primary">
              გამოსვლა
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="card md:col-span-2">
          <h2 className="text-lg font-semibold text-white/95">
            ანგარიშის სტატუსი
          </h2>

          <p className="mt-2 text-sm text-white/70">
            სტატუსი:{" "}
            <span className="font-semibold text-white/90">
              შესული ხარ სისტემაში
            </span>
          </p>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/55">Email</p>
            <p className="mt-1 text-sm font-semibold text-white/90">
              {user.email}
            </p>
          </div>

          <p className="mt-4 text-xs text-white/50">
            შემდეგ ეტაპზე აქ იქნება: purchased courses, progress, lesson access control.
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white/95">
            სწრაფი ქმედებები
          </h2>

          <div className="mt-4 grid gap-2">
            <Link href="/courses" className="btn-secondary">
              კურსების ნახვა
            </Link>
            <Link href="/about" className="btn-secondary">
              ჩვენს შესახებ
            </Link>
            <Link href="/contact" className="btn-secondary">
              კონტაქტი
            </Link>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-white/55">
              Tip: UI უკვე მზადაა, შემდეგ ვამატებთ course details + payment gating-ს.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
