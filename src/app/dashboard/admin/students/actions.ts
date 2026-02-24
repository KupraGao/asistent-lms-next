"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setStudentStatus(formData: FormData) {
  const userId = String(formData.get("userId") || "");
  const status = String(formData.get("status") || "");

  if (!userId) throw new Error("Missing userId");
  if (status !== "active" && status !== "suspended") {
    throw new Error("Invalid status");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin/students");
}