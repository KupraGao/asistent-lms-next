// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieMethodsServer } from "@supabase/ssr";

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll().map((c) => ({
        name: c.name,
        value: c.value,
      }));
    },

    setAll(cookiesToSet) {
      for (const c of cookiesToSet) {
        try {
          cookieStore.set({
            name: c.name,
            value: c.value,
            ...(c.options ?? {}),
          });
        } catch {
          // Server Components context-ში cookie write შეიძლება აიკრძალოს.
          // Route Handler / Middleware-ში იმუშავებს სრულად.
        }
      }
    },
  };

  return createServerClient(url, anonKey, {
    cookies: cookieMethods,
  });
}
