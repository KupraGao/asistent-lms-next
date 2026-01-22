// =======================================================
// FILE: src/app/dashboard/admin/instructors/[id]/page.tsx
// PURPOSE: Admin -> Instructor detail (overview + links)
// ACCESS: მხოლოდ admin
// =======================================================

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";

type ProfileMini = {
  id: string;
  full_name: string | null;
  username: string | null;
  role: string | null;
  status: string | null;
  is_public_instructor: boolean | null;
};

export default async function AdminInstructorDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // =========================
  // 1) Role guard
  // =========================
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");
  if (info.role !== "admin") redirect("/dashboard");

  const { id } = params;

  // =========================
  // 2) Load instructor profile
  // =========================
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, username, role, status, is_public_instructor")
    .eq("id", id)
    .single<ProfileMini>();

  if (error || !profile) {
    return (
      <main className="container-page section-pad">
        <Link
          href="/dashboard/admin/instructors"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          ← ინსტრუქტორები
        </Link>
        <p className="mt-4 text-sm text-red-200">ინსტრუქტორი ვერ მოიძებნა.</p>
      </main>
    );
  }

  const name =
    profile.full_name?.trim() ||
    (profile.username ? `@${profile.username}` : null) ||
    "ინსტრუქტორი";

  // NOTE: თუ გინდა, აქ შეგიძლია role-საც გადაამოწმო
  // if (profile.role !== "instructor" && profile.role !== "admin") { ... }

  return (
    <main className="container-page section-pad">
      {/* =========================
          Header + navigation
         ========================= */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white/95">{name}</h1>
          <p className="mt-2 text-sm text-white/70">
            ინსტრუქტორის დეტალები (MVP).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/admin/instructors"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            ← ინსტრუქტორები
          </Link>
          <Link
            href="/dashboard/admin"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
          >
            ადმინის პანელი
          </Link>
        </div>
      </div>

      {/* =========================
          Info card
         ========================= */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm text-white/70">
          <div>
            <span className="text-white/50">Username: </span>
            <span className="text-white/85">{profile.username ? `@${profile.username}` : "—"}</span>
          </div>
          <div className="mt-1">
            <span className="text-white/50">Role: </span>
            <span className="text-white/85">{profile.role ?? "—"}</span>
          </div>
          <div className="mt-1">
            <span className="text-white/50">Status: </span>
            <span className="text-white/85">{profile.status ?? "—"}</span>
          </div>
          <div className="mt-1">
            <span className="text-white/50">Public instructor: </span>
            <span className="text-white/85">{profile.is_public_instructor ? "კი" : "არა"}</span>
          </div>
        </div>
      </div>

      {/* =========================
          Actions
         ========================= */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/dashboard/admin/instructors/${profile.id}/courses`}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
        >
          ამ ინსტრუქტორის კურსები
        </Link>

        <Link
          href="/dashboard/admin/instructors"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          სიის ნახვა
        </Link>
      </div>

      {/* =========================
          Placeholder section
         ========================= */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6 text-white/70">
        მალე დაემატება: კურსების რაოდენობა, სტუდენტების რაოდენობა,
        ქმედებები (სუსპენდირება/შეზღუდვა) და ა.შ.
      </div>
    </main>
  );
}
