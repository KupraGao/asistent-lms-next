// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // ✅ response წინასწარ ვქმნით, რომ cookie ზუსტად ამ response-ზე ჩაიწეროს
  const response = NextResponse.redirect(new URL("/dashboard", url.origin));

  // თუ code არ არსებობს, დავაბრუნოთ signin error-ით
  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?error=Missing%20OAuth%20code", url.origin)
    );
  }

  try {
    const supabase = await createClient(response);

    // 1) OAuth code -> session (cookie ჩაწერა ამ response-ზე)
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code
    );

    if (exchangeError) {
      return NextResponse.redirect(
        new URL(
          `/auth/sign-in?error=${encodeURIComponent(exchangeError.message)}`,
          url.origin
        )
      );
    }

    // 2) user-ის წამოღება
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // თუ user ვერ წამოვიღეთ, ისევ dashboard redirect დარჩეს (ან signin-ზე გადავამისამართოთ)
    if (userError || !user) {
      return NextResponse.redirect(
        new URL("/auth/sign-in?error=Unable%20to%20fetch%20user", url.origin)
      );
    }

    // 3) profiles ჩანაწერის შექმნა/განახლება (role default: student)
    //    NOTE: დარწმუნდი რომ profiles ცხრილში გაქვს სვეტები: id, email, role, updated_at
    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        role: "student",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    // profiles upsert თუ ვერ მოხერხდა, არ ვაჩერებთ login-ს, მაგრამ შეგვიძლია error დავაბრუნოთ
    if (upsertError) {
      return NextResponse.redirect(
        new URL(
          `/auth/sign-in?error=${encodeURIComponent(
            "Profile save failed: " + upsertError.message
          )}`,
          url.origin
        )
      );
    }

    // 4) ყველაფერი OK -> dashboard (response უკვე redirect-ია)
    return response;
  } catch (e) {
    return NextResponse.redirect(
      new URL(
        `/auth/sign-in?error=${encodeURIComponent("Callback error")}`,
        url.origin
      )
    );
  }
}
