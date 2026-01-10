"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { ok: false, message: "Email და პაროლი აუცილებელია." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return { ok: false, message: error.message };

  // სურვილისამებრ redirect:
  // redirect("/auth/sign-in?success=" + encodeURIComponent("რეგისტრაცია დასრულდა. ახლა შედი სისტემაში."));
  return { ok: true, message: "რეგისტრაცია დასრულდა. ახლა შედი სისტემაში." };
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { ok: false, message: "Email და პაროლი აუცილებელია." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { ok: false, message: "შესვლა ვერ მოხერხდა: " + error.message };

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
