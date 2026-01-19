// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Auth routes PUBLIC (callback MUST pass)
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 🔒 Protect only /dashboard (and subroutes)
  if (pathname.startsWith("/dashboard")) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/sign-in";
      url.searchParams.set("error", "გთხოვ ჯერ შეხვიდე სისტემაში.");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
