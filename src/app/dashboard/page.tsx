import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth/role";

export default async function DashboardEntryPage() {
  const info = await getUserRole();

  if (!info) {
    redirect(
      "/auth/sign-in?error=" +
        encodeURIComponent("გთხოვ ჯერ შეხვიდე სისტემაში.")
    );
  }

  if (info.role === "admin") redirect("/dashboard/admin");
  if (info.role === "instructor") redirect("/dashboard/instructor");
  redirect("/dashboard/student");
}
