// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type SerializeOptionsLike = {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: boolean | "lax" | "strict" | "none";
};

type CookieStoreLike = {
  get?: (name: string) => { name: string; value: string } | undefined;
  set?: (name: string, value: string, options?: Partial<SerializeOptionsLike>) => void;
};

export function createClient() {
  const raw = cookies(); // ✅ no await
  const cookieStore = raw as unknown as CookieStoreLike;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createServerClient(url, anonKey, {
    cookies: {
      // Deprecated interface, მაგრამ Next cookies()-თან runtime-ზე ყველაზე სტაბილურია.
      get(name: string) {
        return cookieStore.get?.(name)?.value;
      },
      set(name: string, value: string, options?: Partial<SerializeOptionsLike>) {
        try {
          cookieStore.set?.(name, value, options);
        } catch {
          // ზოგ კონტექსტში cookie write აიკრძალება; route handler/middleware-ში მოგვარდება.
        }
      },
      remove(name: string, options?: Partial<SerializeOptionsLike>) {
        try {
          cookieStore.set?.(name, "", { ...options, maxAge: 0 });
        } catch {
          // ignore
        }
      },
    } as unknown,
  });
}
