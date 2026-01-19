// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieMethodsServer } from "@supabase/ssr";
import type { NextResponse } from "next/server";

export async function createClient(response?: NextResponse) {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll().map((c: { name: string; value: string }) => ({
        name: c.name,
        value: c.value,
      }));
    },
    setAll(cookiesToSet) {
      for (const c of cookiesToSet) {
        // 1) Next cookie store (RSC/Actions/Middleware contexts)
        try {
          cookieStore.set({
            name: c.name,
            value: c.value,
            ...(c.options ?? {}),
          });
        } catch {
          // Server Components context-ში cookie write შეიძლება აიკრძალოს.
          // Route Handler/Middleware-ში ეს მაინც იმუშავებს response-ს გზით (ქვემოთ).
        }

        // 2) Route Handler response cookies (CRITICAL for OAuth callback)
        if (response) {
          try {
            response.cookies.set({
              name: c.name,
              value: c.value,
              ...(c.options ?? {}),
            });
          } catch {
            // თუ response-ზე ვერ ჩაიწერა, უბრალოდ გავატაროთ
          }
        }
      }
    },
  };

  return createServerClient(url, anonKey, { cookies: cookieMethods });
}
