import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/role";

async function createCourseAction(formData: FormData) {
  "use server";

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "draft").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();

  if (!title) {
    redirect(
      "/dashboard/admin/courses/new?error=" +
        encodeURIComponent("კურსის სათაური აუცილებელია.")
    );
  }

  const status = statusRaw === "published" ? "published" : "draft";
  const price = priceRaw ? Number(priceRaw) : null;

  if (priceRaw && Number.isNaN(price)) {
    redirect(
      "/dashboard/admin/courses/new?error=" +
        encodeURIComponent("ფასის ფორმატი არასწორია.")
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const { error } = await supabase.from("courses").insert({
    title,
    description: description || null,
    status,
    price,
    author_id: user.id,
  });

  if (error) {
    redirect(
      "/dashboard/admin/courses/new?error=" +
        encodeURIComponent("კურსის შექმნა ვერ მოხერხდა: " + error.message)
    );
  }

  redirect(
    "/dashboard/admin/courses?success=" + encodeURIComponent("კურსი შეიქმნა.")
  );
}

export default async function AdminCourseNewPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const info = await getUserRole();
  if (!info) redirect("/auth/sign-in");
  if (info.role !== "admin") redirect("/dashboard");

  const sp = (await searchParams) ?? {};
  const error =
    typeof sp.error === "string"
      ? sp.error
      : Array.isArray(sp.error)
      ? sp.error[0]
      : undefined;

  const success =
    typeof sp.success === "string"
      ? sp.success
      : Array.isArray(sp.success)
      ? sp.success[0]
      : undefined;

  return (
    <main className="container-page section-pad">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          ← ადმინის პანელი
        </Link>

        <Link
          href="/dashboard/admin/courses"
          className="text-sm font-semibold text-white/70 hover:text-white/90"
        >
          ყველა კურსი →
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-white/95">კურსის შექმნა</h1>
      <p className="mt-2 text-sm text-white/70">
        MVP: სათაური, აღწერა, სტატუსი, ფასი (სურვილისამებრ)
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-red-200">
          {decodeURIComponent(error)}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-emerald-200">
          {decodeURIComponent(success)}
        </div>
      )}

      <form action={createCourseAction} className="mt-6 grid gap-3">
        <input
          className="auth-input"
          name="title"
          required
          placeholder="კურსის სათაური"
        />

        <textarea
          className="auth-input min-h-[120px]"
          name="description"
          placeholder="კურსის აღწერა (სურვილისამებრ)"
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <select
  className="auth-input"
  name="status"
  defaultValue="draft"
  aria-label="კურსის სტატუსი"
  title="კურსის სტატუსი"
>
  <option value="draft">დრაფტი</option>
  <option value="published">გამოქვეყნებული</option>
</select>


          <input
            className="auth-input"
            name="price"
            type="number"
            step="0.01"
            placeholder="ფასი (სურვილისამებრ)"
          />
        </div>

        <button type="submit" className="btn-primary w-full justify-center">
          შექმნა
        </button>
      </form>
    </main>
  );
}
