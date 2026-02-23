import { createClient } from "@/lib/supabase/server";

type CourseMini = {
  id: string;
  title: string;
  status: string | null;
  price: number | null;
  price_label: string | null;
  duration: string | null;
  level: string | null;
  author_id: string | null;
};

type ProfileMini = {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  status: string | null;
  role: string | null;
};

// ✅ what pages will receive (normalized: single course/profile or null)
export type PurchasedRow = {
  created_at: string;
  status: string;
  courses: CourseMini | null;
};

export type StudentRow = {
  created_at: string;
  status: string;
  student: ProfileMini | null;
};

// ✅ raw shapes from Supabase joins (often arrays)
type PurchasedRowRaw = {
  created_at: string;
  status: string;
  courses: CourseMini[] | CourseMini | null;
};

type StudentRowRaw = {
  created_at: string;
  status: string;
  student: ProfileMini[] | ProfileMini | null;
};

function firstOrNull<T>(v: T[] | T | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

export async function isEnrolled(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .eq("status", "active")
    .maybeSingle();

  if (error) return false;
  return !!data;
}

export async function getPurchasedCourses(): Promise<PurchasedRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
      created_at,
      status,
      courses:course_id (
        id, title, status, price, price_label, duration, level, author_id
      )
    `
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const raw = data as unknown as PurchasedRowRaw[];
  return raw.map((r) => ({
    created_at: r.created_at,
    status: r.status,
    courses: firstOrNull(r.courses),
  }));
}

export async function getStudentsByCourse(courseId: string): Promise<StudentRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
      created_at,
      status,
      student:user_id (
        id, email, full_name, username, phone, status, role
      )
    `
    )
    .eq("course_id", courseId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const raw = data as unknown as StudentRowRaw[];
  return raw.map((r) => ({
    created_at: r.created_at,
    status: r.status,
    student: firstOrNull(r.student),
  }));
}

export async function enrollSelf(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("enrollments")
    .insert({ user_id: user.id, course_id: courseId, status: "active" });

  if (error) throw new Error(error.message);
  return true;
}