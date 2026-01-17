"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: boolean; message: string };

export async function signUpAction(formData: FormData): Promise<ActionResult> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  // მინიმალური ვალიდაცია
  if (!firstName || !lastName || !username || !email || !password) {
    return { ok: false, message: "გთხოვ შეავსე ყველა აუცილებელი ველი." };
  }

  if (password.length < 6) {
    return { ok: false, message: "პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო." };
  }

  if (confirmPassword && password !== confirmPassword) {
    return { ok: false, message: "პაროლები არ ემთხვევა ერთმანეთს." };
  }

  const supabase = await createClient();

  // 1) Auth signup
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return { ok: false, message: error.message };

  const userId = data.user?.id;
  if (!userId) {
    return {
      ok: false,
      message: "რეგისტრაცია შესრულდა, მაგრამ მომხმარებლის ID ვერ მოიძებნა.",
    };
  }

  // 2) Update profile (row is created by trigger)
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
    // username unique conflict ყველაზე ხშირია
    if (profileError.code === "23505") {
      return { ok: false, message: "ეს მომხმარებლის სახელი უკვე დაკავებულია. სცადე სხვა." };
    }
    return { ok: false, message: "პროფილის მონაცემების შენახვა ვერ მოხერხდა." };
  }

  // შენს UX-ზეა:
  // - ან პირდაპირ შესვლაზე გაუშვა
  // - ან მიუთითო რომ მეილით დაადასტუროს (თუ confirm ჩართულია)
  return { ok: true, message: "რეგისტრაცია დასრულდა. ახლა შედი სისტემაში." };
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

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
