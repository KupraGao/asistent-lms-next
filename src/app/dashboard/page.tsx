// FILE: src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth/role";
import AdminDashboardPage from "./admin/page";
import InstructorDashboardPage from "./instructor/page";
import StudentDashboardPage from "./student/page";

export default async function DashboardHomePage() {
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");

  if (info.role === "admin") return <AdminDashboardPage />;
  if (info.role === "instructor") return <InstructorDashboardPage />;
  return <StudentDashboardPage />;
}
