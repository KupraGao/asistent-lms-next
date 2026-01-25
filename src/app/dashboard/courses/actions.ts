"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";
import { revalidatePath } from "next/cache";

type ManagerRole = "admin" | "instructor";

async function requireCourseManager(courseId: string): Promise<{
  role: ManagerRole;
  userId: string;
}> {
  const info = await getUserRole();
  if (!info) throw new Error("გთხოვ შედი სისტემაში.");

  if (info.role !== "admin" && info.role !== "instructor") {
    throw new Error("წვდომა არ გაქვს.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("გთხოვ შედი სისტემაში.");

  // instructor => მხოლოდ თავის კურსზე
  if (info.role === "instructor") {
    const { data, error } = await supabase
      .from("courses")
      .select("author_id")
      .eq("id", courseId)
      .single<{ author_id: string | null }>();

    if (error || !data) throw new Error("კურსი ვერ მოიძებნა.");
    if (data.author_id !== user.id) throw new Error("სხვის კურსს ვერ მართავ.");
  }

  return { role: info.role, userId: user.id };
}

export async function togglePublishAction(formData: FormData) {
  const courseId = String(formData.get("courseId") ?? "").trim();
  const nextStatus = String(formData.get("nextStatus") ?? "").trim();

  if (!courseId) throw new Error("courseId აკლია.");
  if (nextStatus !== "draft" && nextStatus !== "published") {
    throw new Error("არასწორი status.");
  }

  await requireCourseManager(courseId);

  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({ status: nextStatus })
    .eq("id", courseId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/my-courses");
}

export async function deleteCourseAction(formData: FormData) {
  const courseId = String(formData.get("courseId") ?? "").trim();
  if (!courseId) throw new Error("courseId აკლია.");

  await requireCourseManager(courseId);

  const supabase = await createClient();
  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/courses");
  revalidatePath("/dashboard/my-courses");
}
