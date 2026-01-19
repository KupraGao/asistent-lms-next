import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // ✅ OAuth callback route-ზე middleware საერთოდ არ უნდა ერეოდეს
  if (url.pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // ✅ თუ Supabase აბრუნებს code-ს root-ზე → გადავიყვანოთ /auth/callback-ზე
  if (url.pathname === "/" && url.searchParams.has("code")) {
    const redirectUrl = url.clone();
    redirectUrl.pathname = "/auth/callback";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  // დავიჭიროთ ყველა request, მაგრამ გამოვრიცხოთ _next და favicon
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
