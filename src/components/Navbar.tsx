import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-white/95 hover:text-white"
        >
          Asistent LMS
        </Link>

        {/* Main nav */}
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

        {/* Auth buttons */}
        <div className="flex items-center gap-2">
          <Link href="/auth/sign-in" className="btn-secondary">
            შესვლა
          </Link>
          <Link href="/auth/sign-up" className="btn-primary">
            რეგისტრაცია
          </Link>
        </div>
      </div>
    </header>
  );
}
