"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Role = "admin" | "instructor" | "student";

type NavItem = {
  label: string;
  href: string;
  roles?: Role[];
};

export default function DashboardNav({ role }: { role: Role }) {
  const pathname = usePathname();

  const items: NavItem[] = [
    // ყველასთვის
    { label: "დეშბორდი", href: "/dashboard", roles: ["admin", "instructor", "student"] },

    // admin + student (ინსტრუქტორს არა)
    { label: "ყველა კურსი", href: "/dashboard/courses", roles: ["admin"] },

    // admin + instructor
    { label: "ჩემი კურსები", href: "/dashboard/my-courses", roles: ["admin", "instructor"] },

    // ყველასთვის (თუ გინდა student-only იყოს, მითხარი და შევცვლი)
    { label: "ნაყიდი კურსები", href: "/dashboard/my-learning", roles: ["admin", "instructor", "student"] },

    // admin + instructor
    { label: "კურსის შექმნა", href: "/dashboard/courses/new", roles: ["admin", "instructor"] },

    // admin-only
    { label: "ინსტრუქტორები", href: "/dashboard/admin/instructors", roles: ["admin"] },
    { label: "ყველა სტუდენტი", href: "/dashboard/admin/students", roles: ["admin"] },
  ];

  return (
    <nav className="mt-6">
      <h2 className="text-sm font-semibold text-white/80">ნავიგაცია</h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {items
          .filter((item) => !item.roles || item.roles.includes(role))
          .map((item) => {
            const isDashboard = item.href === "/dashboard";

            const isActive = isDashboard
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "rounded-xl px-4 py-2 text-sm font-semibold transition " +
                  (isActive
                    ? "bg-white text-black"
                    : "border border-white/15 bg-white/5 text-white/85 hover:bg-white/10")
                }
              >
                {item.label}
              </Link>
            );
          })}
      </div>
    </nav>
  );
}
