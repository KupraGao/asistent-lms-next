"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/* ---------- helpers ---------- */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    const m = (error as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "Authentication error";
}

/* ---------- SIGN IN ---------- */
export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(
      "/auth/sign-in?error=" +
        encodeURIComponent("Email and password are required")
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      "/auth/sign-in?error=" +
        encodeURIComponent(getErrorMessage(error))
    );
  }

  redirect("/dashboard");
}

/* ---------- SIGN UP ---------- */
export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect(
      "/auth/sign-up?error=" +
        encodeURIComponent("Email and password are required")
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect(
      "/auth/sign-up?error=" +
        encodeURIComponent(getErrorMessage(error))
    );
  }

  redirect(
    "/auth/sign-in?success=" +
      encodeURIComponent("Account created. Please sign in.")
  );
}

/* ---------- SIGN OUT ---------- */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
