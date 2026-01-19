// src/app/auth/sign-in/page.tsx
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

        {error ? (
          <div className="auth-alert auth-alert--error">
            {decodeURIComponent(error)}
          </div>
        ) : null}

        {success ? (
          <div className="auth-alert auth-alert--success">
            {decodeURIComponent(success)}
          </div>
        ) : null}

        {/* Email / Password */}
        <form action={signInAction} className="auth-form">
          <label className="auth-field">
            <span className="auth-label">ელფოსტა</span>
            <input className="auth-input" name="email" type="email" required />
          </label>

          <label className="auth-field">
            <span className="auth-label">პაროლი</span>
            <input
              className="auth-input"
              name="password"
              type="password"
              required
            />
          </label>

          <button type="submit" className="btn-primary w-full justify-center">
            შესვლა
          </button>
        </form>

        {/* Providers as buttons */}
        <div className="mt-5 grid gap-2">
          <div className="relative my-2 h-px bg-white/10">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs font-semibold text-white/70 backdrop-blur">
              ან
            </span>
          </div>

         <Link
  href="/auth/oauth?provider=google"
  className="btn-secondary w-full justify-center"
  aria-label="Google-ით შესვლა"
>
  Google-ით გაგრძელება
</Link>


          <Link
            href="/auth/sign-in?provider=facebook"
            className="btn-secondary w-full justify-center"
            aria-label="Facebook-ით შესვლა"
          >
            Facebook-ით გაგრძელება
          </Link>

          <Link
            href="/auth/sign-in?provider=instagram"
            className="btn-secondary w-full justify-center"
            aria-label="Instagram-ით შესვლა"
          >
            Instagram-ით გაგრძელება
          </Link>
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
