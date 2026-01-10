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
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">Access your dashboard and courses.</p>

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

        <form action={signInAction} className="auth-form">
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input className="auth-input" name="email" type="email" required />
          </label>

          <label className="auth-field">
            <span className="auth-label">Password</span>
            <input
              className="auth-input"
              name="password"
              type="password"
              required
            />
          </label>

          <button type="submit" className="btn-primary w-full">
            Sign in
          </button>
        </form>

        <p className="auth-footer">
          No account?{" "}
          <Link className="link-soft" href="/auth/sign-up">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
