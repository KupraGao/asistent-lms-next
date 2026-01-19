// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // ✅ response წინასწარ ვქმნით, რომ cookie ზუსტად ამ response-ზე ჩაიწეროს
  const response = NextResponse.redirect(new URL("/dashboard", url.origin));

  if (code) {
    const supabase = await createClient(response);
    await supabase.auth.exchangeCodeForSession(code);
  }

  return response;
}
