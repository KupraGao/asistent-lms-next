import DashboardNav from "@/components/DashboardNav";
import { getUserRole } from "@/lib/auth/role";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const info = await getUserRole();

  return (
    <div className="container-page section-pad">
      <DashboardNav role={info?.role ?? "student"} />
      <div className="mt-8">{children}</div>
    </div>
  );
}
