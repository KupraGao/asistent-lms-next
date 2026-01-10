import Link from "next/link";
import { signUp } from "@/app/auth/actions";

export default async function SignUpPage({
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
              რეგისტრაცია
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-white/70">
              შექმენი ახალი ანგარიში და დაიწყე სწავლა.
            </p>
          </div>

          {error ? (
            <div className="mb-4 rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">
              <span className="font-semibold">შეცდომა:</span> {error}
            </div>
          ) : null}

          <form action={signUp} className="space-y-4">
            {/* Full name */}
            <div className="space-y-1">
              <label
                htmlFor="full_name"
                className="text-sm font-medium text-white/85"
              >
                სახელი და გვარი
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/45 outline-none transition focus:border-sky-300/40 focus:ring-2 focus:ring-sky-400/20"
                placeholder="გიორგი აბაშიძე"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-sm font-medium text-white/85"
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

            {/* Password */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="text-sm font-medium text-white/85"
              >
                პაროლი
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/45 outline-none transition focus:border-indigo-300/40 focus:ring-2 focus:ring-indigo-400/20"
                placeholder="მინიმუმ 6–8 სიმბოლო"
              />
            </div>

            {/* Confirm password */}
            <div className="space-y-1">
              <label
                htmlFor="password_confirm"
                className="text-sm font-medium text-white/85"
              >
                გაიმეორე პაროლი
              </label>
              <input
                id="password_confirm"
                name="password_confirm"
                type="password"
                required
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/45 outline-none transition focus:border-indigo-300/40 focus:ring-2 focus:ring-indigo-400/20"
                placeholder="გაიმეორე პაროლი"
              />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                required
                className="mt-1 rounded border-white/20 bg-white/10 text-sky-400 focus:ring-sky-400/30"
              />
              <span>
                ვეთანხმები{" "}
                <Link href="/terms" className="link-soft">
                  წესებს
                </Link>{" "}
                და{" "}
                <Link href="/privacy" className="link-soft">
                  კონფიდენციალურობის პოლიტიკას
                </Link>
                .
              </span>
            </label>

            <button type="submit" className="btn-primary w-full">
              ანგარიშის შექმნა
            </button>
          </form>

          <p className="mt-4 text-sm text-white/70">
            უკვე გაქვს ანგარიში?{" "}
            <Link className="link-soft" href="/auth/sign-in">
              შესვლა
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
