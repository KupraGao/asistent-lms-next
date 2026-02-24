// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Protect only /dashboard (and subroutes)
  if (pathname.startsWith("/dashboard")) {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 🔒 Not logged in -> sign in
    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/sign-in";
      url.searchParams.set("error", "login_required"); // შეგიძლია შენი ტექსტიც
      return NextResponse.redirect(url);
    }

    // ✅ Check profile status
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();

    // 🚫 Suspended -> block dashboard access
    if (!profileError && profile?.status === "suspended") {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/sign-in";
      url.searchParams.set("error", "suspended");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // ✅ run middleware ONLY for dashboard routes
  matcher: ["/dashboard/:path*"],
};