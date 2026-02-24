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
  progress: number; // ✅ NEW
  last_lesson_id: string | null; // ✅ NEW
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
  progress: number | null; // ✅ NEW
  last_lesson_id: string | null; // ✅ NEW
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
      progress,
      last_lesson_id,
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
    progress: r.progress ?? 0,
    last_lesson_id: r.last_lesson_id ?? null,
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

// ✅ NEW: student updates ONLY their own enrollment (progress + last_lesson_id)
type EnrollmentUpdate = {
  progress: number;
  last_lesson_id: string | null;
};

export async function updateMyEnrollment(
  courseId: string,
  payload: { progress?: number; last_lesson_id?: string | null }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const updateData: Partial<EnrollmentUpdate> = {};

  if (typeof payload.progress === "number") {
    updateData.progress = payload.progress;
  }

  if ("last_lesson_id" in payload) {
    updateData.last_lesson_id = payload.last_lesson_id ?? null;
  }

  // nothing to update
  if (Object.keys(updateData).length === 0) return true;

  const { error } = await supabase
    .from("enrollments")
    .update(updateData)
    .eq("user_id", user.id)
    .eq("course_id", courseId);

  if (error) throw new Error(error.message);
  return true;
}