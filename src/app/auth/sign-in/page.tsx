import Link from "next/link";
import { signIn } from "@/app/auth/actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const error = sp?.error ? decodeURIComponent(sp.error) : "";

  return (
    <main className="container-page section-pad">
      <div className="mx-auto max-w-md">
        <div className="card">
          <div className="mb-5">
            <h1 className="text-2xl font-semibold tracking-tight text-white/95">
              შესვლა
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-white/70">
              შედი სისტემაში და გადადი პირად კაბინეტში.
            </p>
          </div>

          {error ? (
            <div className="mb-4 rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">
              <span className="font-semibold">შეცდომა:</span> {error}
            </div>
          ) : null}

          <form action={signIn} className="space-y-4">
            <div className="space-y-1">
              <label
                className="text-sm font-medium text-white/85"
                htmlFor="email"
              >
                ელ. ფოსტა (Email)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/45 outline-none transition focus:border-sky-300/40 focus:ring-2 focus:ring-sky-400/20"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <label
                className="text-sm font-medium text-white/85"
                htmlFor="password"
              >
                პაროლი
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/45 outline-none transition focus:border-indigo-300/40 focus:ring-2 focus:ring-indigo-400/20"
                placeholder="შეიყვანე პაროლი"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              შესვლა
            </button>
          </form>

          <p className="mt-4 text-sm text-white/70">
            არ გაქვს ანგარიში?{" "}
            <Link className="link-soft" href="/auth/sign-up">
              რეგისტრაცია
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-white/45">
          By continuing you agree to our platform rules.
        </p>
      </div>
    </main>
  );
}
