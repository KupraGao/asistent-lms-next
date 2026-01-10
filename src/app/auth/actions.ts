"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  return "დაფიქსირდა შეცდომა";
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    redirect("/auth/sign-up?error=" + encodeURIComponent("ელ.ფოსტა და პაროლი აუცილებელია"));
  }

  const supabase = createClient();


  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect("/auth/sign-up?error=" + encodeURIComponent(getErrorMessage(error)));
  }

  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    redirect("/auth/sign-in?error=" + encodeURIComponent("ელ.ფოსტა და პაროლი აუცილებელია"));
  }

  const supabase = createClient();


  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/auth/sign-in?error=" + encodeURIComponent(getErrorMessage(error)));
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = createClient();

  await supabase.auth.signOut();
  redirect("/");
}
