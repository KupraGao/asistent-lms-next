import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/auth/actions";
import AccountMenu from "@/components/AccountMenu";

type MenuRole = "student" | "instructor" | "admin" | "guest";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: MenuRole = "guest";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const r = profile?.role;
    if (r === "student" || r === "instructor" || r === "admin") {
      role = r;
    } else {
      // თუ profile არ არსებობს ან role ცარიელია, უსაფრთხოდ student-ზე გადავიყვანოთ
      role = "student";
    }
  }

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

        {/* When authed, AccountMenu must be inside the form so submit runs signOutAction */}
        {user ? (
          <form action={signOutAction}>
            <AccountMenu isAuthed={true} accountHref={accountHref} role={role} />
          </form>
        ) : (
          <AccountMenu isAuthed={false} accountHref={accountHref} role="guest" />
        )}
      </div>
    </header>
  );
}
