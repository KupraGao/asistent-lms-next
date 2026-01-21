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
        <h1 className="auth-title">ანგარიშის შექმნა</h1>
        <p className="auth-subtitle">დარეგისტრირდი და დაიწყე სწავლა.</p>

        {error && (
          <div className="auth-alert auth-alert--error">
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={signUpAction} className="auth-form">
          {/* First & Last name */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              className="auth-input"
              name="firstName"
              type="text"
              required
              placeholder="სახელი"
              autoComplete="given-name"
            />

            <input
              className="auth-input"
              name="lastName"
              type="text"
              required
              placeholder="გვარი"
              autoComplete="family-name"
            />
          </div>

          <input
            className="auth-input"
            name="username"
            type="text"
            required
            minLength={3}
            placeholder="მომხმარებლის სახელი"
            autoComplete="username"
          />

          <input
            className="auth-input"
            name="phone"
            type="tel"
            placeholder="ტელეფონი (სურვილისამებრ)"
            autoComplete="tel"
          />

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
            minLength={6}
            placeholder="პაროლი"
            autoComplete="new-password"
          />

          <input
            className="auth-input"
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            placeholder="გაიმეორე პაროლი"
            autoComplete="new-password"
          />

          <button type="submit" className="btn-primary w-full justify-center">
            ანგარიშის შექმნა
          </button>
        </form>

        <p className="auth-footer">
          უკვე გაქვს ანგარიში?{" "}
          <Link className="link-soft" href="/auth/sign-in">
            შესვლა
          </Link>
        </p>
      </div>
    </div>
  );
}
