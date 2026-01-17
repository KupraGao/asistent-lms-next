// src/components/Navbar.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const accountHref = user ? "/dashboard" : "/auth/sign-in";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-white/95 hover:text-white"
        >
          Asistent LMS
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-white/80 transition hover:text-white hover:underline hover:underline-offset-4"
          >
            მთავარი
          </Link>
          <Link
            href="/courses"
            className="text-sm font-medium text-white/80 transition hover:text-white hover:underline hover:underline-offset-4"
          >
            კურსები
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-white/80 transition hover:text-white hover:underline hover:underline-offset-4"
          >
            ჩვენს შესახებ
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-white/80 transition hover:text-white hover:underline hover:underline-offset-4"
          >
            კონტაქტი
          </Link>
        </nav>

        <Link href={accountHref} className="nav-avatar" aria-label="ანგარიში">
          <span className="nav-avatar__ring" aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 12a4.2 4.2 0 1 0-4.2-4.2A4.2 4.2 0 0 0 12 12Zm0 2.2c-4.2 0-7.6 2.3-7.6 5.2 0 .8.6 1.4 1.4 1.4h12.4c.8 0 1.4-.6 1.4-1.4 0-2.9-3.4-5.2-7.6-5.2Z"
                fill="currentColor"
                opacity="0.92"
              />
            </svg>
          </span>
        </Link>
      </div>
    </header>
  );
}
