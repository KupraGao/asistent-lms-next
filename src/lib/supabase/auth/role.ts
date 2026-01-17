import { createClient } from "@/lib/supabase/server";

export type Role = "student" | "instructor" | "admin";

/**
 * აბრუნებს user + role-ს
 * თუ არ არის ავტორიზებული ან profile არ არსებობს → null
 */
export async function getUserRole(): Promise<{
  userId: string;
  role: Role;
} | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return null;

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profErr || !profile?.role) return null;

  return {
    userId: user.id,
    role: profile.role as Role,
  };
}

/**
 * role-based დაშვების შემოწმება
 */
export function isRoleAllowed(userRole: Role, required: Role): boolean {
  if (userRole === "admin") return true;
  if (required === "student") return true;
  if (required === "instructor") return userRole === "instructor";
  return false; // required === "admin"
}
