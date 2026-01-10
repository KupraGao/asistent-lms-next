// src/app/auth/sign-up/page.tsx
import Link from "next/link";
import { signUpAction } from "@/app/auth/actions";

export default async function SignUpPage({
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

  return (
    <div className="auth-shell">
      <div className="card auth-card">
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Sign up to start learning.</p>

        {error ? (
          <div className="auth-alert auth-alert--error">
            {decodeURIComponent(error)}
          </div>
        ) : null}

        <form action={signUpAction} className="auth-form">
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
            Create account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link className="link-soft" href="/auth/sign-in">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
