import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const provider = searchParams.get("provider");

  if (provider !== "google") {
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=Invalid%20provider", origin)
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data?.url) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=OAuth%20failed", origin)
    );
  }

  return NextResponse.redirect(data.url);
}
