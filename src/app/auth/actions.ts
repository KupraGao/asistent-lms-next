"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUpAction(formData: FormData): Promise<void> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!firstName || !lastName || !username || !email || !password) {
    redirect("/auth/sign-up?error=" + encodeURIComponent("გთხოვ შეავსე ყველა აუცილებელი ველი."));
  }

  if (password.length < 6) {
    redirect("/auth/sign-up?error=" + encodeURIComponent("პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო."));
  }

  if (confirmPassword && password !== confirmPassword) {
    redirect("/auth/sign-up?error=" + encodeURIComponent("პაროლები არ ემთხვევა ერთმანეთს."));
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) redirect("/auth/sign-up?error=" + encodeURIComponent(error.message));

  const userId = data.user?.id;
  if (!userId) {
    redirect("/auth/sign-up?error=" + encodeURIComponent("მომხმარებლის ID ვერ მოიძებნა."));
  }

  const fullName = `${firstName} ${lastName}`.trim();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      username,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) {
    const msg =
      profileError.code === "23505"
        ? "ეს მომხმარებლის სახელი უკვე დაკავებულია. სცადე სხვა."
        : "პროფილის მონაცემების შენახვა ვერ მოხერხდა.";
    redirect("/auth/sign-up?error=" + encodeURIComponent(msg));
  }

  redirect("/auth/sign-in?success=" + encodeURIComponent("რეგისტრაცია დასრულდა. ახლა შედი სისტემაში."));
}

export async function signInAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/auth/sign-in?error=" + encodeURIComponent("Email და პაროლი აუცილებელია."));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/auth/sign-in?error=" + encodeURIComponent("შესვლა ვერ მოხერხდა: " + error.message));
  }

  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
