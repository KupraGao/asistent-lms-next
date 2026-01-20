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

    if (userError || !user) {
      return NextResponse.redirect(
        new URL("/auth/sign-in?error=Unable%20to%20fetch%20user", url.origin)
      );
    }

    // 3) profiles: თუ არ არსებობს -> შევქმნათ (role=student)
    //    თუ არსებობს -> role-ს არ ვეხებით (admin/instructor არ უნდა გადაიწეროს)
    const { data: existingProfile, error: profileReadError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileReadError) {
      return NextResponse.redirect(
        new URL(
          `/auth/sign-in?error=${encodeURIComponent(
            "Profile read failed: " + profileReadError.message
          )}`,
          url.origin
        )
      );
    }

    const nowIso = new Date().toISOString();

    if (!existingProfile) {
      // ✅ პირველად შექმნა — აქ ვუწერთ default role-ს
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        role: "student",
        updated_at: nowIso,
      });

      if (insertError) {
        return NextResponse.redirect(
          new URL(
            `/auth/sign-in?error=${encodeURIComponent(
              "Profile insert failed: " + insertError.message
            )}`,
            url.origin
          )
        );
      }
    } else {
      // ✅ უკვე არსებობს — მხოლოდ უსაფრთხო ველებს ვაახლებთ (role უცვლელია)
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          email: user.email,
          updated_at: nowIso,
        })
        .eq("id", user.id);

      if (updateError) {
        return NextResponse.redirect(
          new URL(
            `/auth/sign-in?error=${encodeURIComponent(
              "Profile update failed: " + updateError.message
            )}`,
            url.origin
          )
        );
      }
    }

    // 4) ყველაფერი OK -> dashboard (response უკვე redirect-ია)
    return response;
  } catch {
    return NextResponse.redirect(
      new URL(
        `/auth/sign-in?error=${encodeURIComponent("Callback error")}`,
        url.origin
      )
    );
  }
}
