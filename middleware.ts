import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // თუ Supabase აბრუნებს code-ს root-ზე → გადავიყვანოთ /auth/callback-ზე
  if (url.pathname === "/" && url.searchParams.has("code")) {
    const redirectUrl = url.clone();
    redirectUrl.pathname = "/auth/callback";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
