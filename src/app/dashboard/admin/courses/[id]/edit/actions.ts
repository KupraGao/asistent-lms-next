"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";

export async function updateCourseAction(formData: FormData) {
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");
  if (info.role !== "admin") redirect("/dashboard");

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();

  if (!id || id === "undefined") redirect("/dashboard/admin/courses");
  if (!title) redirect(`/dashboard/admin/courses/${id}/edit?error=title_required`);

  const description = descriptionRaw ? descriptionRaw : null;

  if (statusRaw !== "draft" && statusRaw !== "published") {
    redirect(`/dashboard/admin/courses/${id}/edit?error=invalid_status`);
  }
  const status: "draft" | "published" = statusRaw;

  // ✅ price: ცარიელი => null (უფასო), ხოლო ვალიდაცია მხოლოდ მაშინ როცა შეყვანილია
  let price: number | null = null;

  if (priceRaw !== "") {
    const parsed = Number(priceRaw);
    if (!Number.isFinite(parsed) || parsed < 0) {
      redirect(`/dashboard/admin/courses/${id}/edit?error=invalid_price`);
    }
    price = parsed;
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("courses")
    .update({
      title,
      description,
      status,
      price,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(
      `/dashboard/admin/courses/${id}/edit?error=${encodeURIComponent(error.message)}`
    );
  }

  redirect(`/dashboard/admin/courses/${id}?success=updated`);
}
