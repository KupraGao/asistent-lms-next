import Link from "next/link";
import { signInAction } from "@/app/auth/actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};

  const error =
    typeof sp.error === "string"
      ? sp.error
      : Array.isArray(sp.error)
      ? sp.error[0]
      : undefined;

  const success =
    typeof sp.success === "string"
      ? sp.success
      : Array.isArray(sp.success)
      ? sp.success[0]
      : undefined;

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <h1 className="auth-title">შესვლა</h1>
        <p className="auth-subtitle">შედი პირად კაბინეტში და განაგრძე სწავლა.</p>

        {error && (
          <div className="auth-alert auth-alert--error">
            {decodeURIComponent(error)}
          </div>
        )}

        {success && (
          <div className="auth-alert auth-alert--success">
            {decodeURIComponent(success)}
          </div>
        )}

        {/* Email / Password (placeholders only) */}
        <form action={signInAction} className="auth-form">
          <input
            className="auth-input"
            name="email"
            type="email"
            required
            placeholder="ელფოსტა"
            autoComplete="email"
            inputMode="email"
          />

          <input
            className="auth-input"
            name="password"
            type="password"
            required
            placeholder="პაროლი"
            autoComplete="current-password"
          />

          <button type="submit" className="btn-primary w-full justify-center">
            შესვლა
          </button>
        </form>

        {/* Providers */}
        <div className="mt-10">
          {/* Divider */}
          <div className="relative my-6 h-px bg-white/10">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs font-semibold text-white/70 backdrop-blur">
              ან
            </span>
          </div>

          {/* Providers – bigger icons + more spacing + lower */}
          <div className="flex items-center justify-center gap-8">
            {/* Google */}
            <Link
              href="/auth/oauth?provider=google"
              aria-label="Google-ით შესვლა"
              title="Google"
              className="
                btn-secondary
                flex h-16 w-16 items-center justify-center
                rounded-full
                transition
                hover:scale-105
                active:scale-95
              "
            >
              <GoogleIcon className="h-9 w-9" />
            </Link>

            {/* GitHub */}
            <Link
              href="/auth/oauth?provider=github"
              aria-label="GitHub-ით შესვლა"
              title="GitHub"
              className="
                btn-secondary
                flex h-16 w-16 items-center justify-center
                rounded-full
                transition
                hover:scale-105
                active:scale-95
              "
            >
              <GitHubIcon className="h-9 w-9" />
            </Link>

            {/* Facebook */}
            <Link
              href="/auth/oauth?provider=facebook"
              aria-label="Facebook-ით შესვლა"
              title="Facebook"
              className="
                btn-secondary
                flex h-16 w-16 items-center justify-center
                rounded-full
                transition
                hover:scale-105
                active:scale-95
              "
            >
              <FacebookIcon className="h-9 w-9" />
            </Link>
          </div>
        </div>

        <p className="auth-footer">
          ანგარიში არ გაქვს?{" "}
          <Link className="link-soft" href="/auth/sign-up">
            რეგისტრაცია
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ================= Icons (flexible sizing via className) ================= */

function GoogleIcon({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.4H42V20H24v8h11.3C33.7 32.5 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.5 0 19-8.5 19-20 0-1.3-.1-2.3-.4-3.6z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.4 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.3 6.1 29.4 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.1 0 9.8-2 13.4-5.2l-6.2-5.1C29 35.1 26.6 36 24 36c-5.1 0-9.4-3.4-10.9-8.1l-6.5 5C9.9 39.6 16.4 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.4H42V20H24v8h11.3c-1.1 3-3.3 5.4-6.1 6.9l.1.1 6.2 5.1C34.8 42 43 36 43 24c0-1.3-.1-2.3-.4-3.6z"
      />
    </svg>
  );
}

function GitHubIcon({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1.7 2.1 2.9 1.5.1-.7.4-1.1.7-1.4-2.5-.3-5.1-1.2-5.1-5.4 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 .1.9-.2 1.8-.3 2.7-.3s1.8.1 2.7.3c2.1-.4 3-.1 3-.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.8 1.1 3 0 4.2-2.6 5.1-5.1 5.4.4.4.8 1 .8 2v3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}

function FacebookIcon({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="#1877F2"
      className={className}
      aria-hidden="true"
    >
      <path d="M22.7 12.1C22.7 6.5 18.2 2 12.6 2S2.5 6.5 2.5 12.1c0 5 3.7 9.2 8.5 10v-7.1H8.5v-2.9H11v-2.2c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6v1.9h2.7l-.4 2.9h-2.3v7.1c4.8-.8 8.5-5 8.5-10z" />
    </svg>
  );
}
