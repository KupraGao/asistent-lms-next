"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";

async function requireAdmin() {
  const info = await getUserRole();
  if (!info || info.role !== "admin") {
    throw new Error("არ გაქვს უფლება (admin only).");
  }
}

export async function togglePublishAction(formData: FormData) {
  await requireAdmin();

  const courseId = String(formData.get("courseId") ?? "");
  const nextStatus = String(formData.get("nextStatus") ?? "");

  if (!courseId) throw new Error("courseId აკლია.");
  if (nextStatus !== "draft" && nextStatus !== "published") {
    throw new Error("არასწორი status.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({ status: nextStatus })
    .eq("id", courseId);

  if (error) throw new Error(error.message);
}

export async function deleteCourseAction(formData: FormData) {
  await requireAdmin();

  const courseId = String(formData.get("courseId") ?? "");
  if (!courseId) throw new Error("courseId აკლია.");

  const supabase = await createClient();

  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) throw new Error(error.message);
}
