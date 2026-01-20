// src/app/auth/oauth/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type OAuthProvider = "google" | "github" | "facebook";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);

  const raw = searchParams.get("provider") ?? "";
  const provider = raw.trim().toLowerCase() as OAuthProvider;

  // ✅ Allow only known providers (avoid arbitrary input)
  const allowed: OAuthProvider[] = ["google", "github", "facebook"];
  if (!allowed.includes(provider)) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=Invalid%20provider", origin)
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data?.url) {
    return NextResponse.redirect(
      new URL(
        `/auth/sign-in?error=${encodeURIComponent(error?.message ?? "OAuth failed")}`,
        origin
      )
    );
  }

  return NextResponse.redirect(data.url);
}
