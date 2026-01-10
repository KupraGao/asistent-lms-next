import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-page section-pad">
      <div className="mx-auto max-w-xl card">
        <h1 className="text-2xl font-semibold tracking-tight text-white/95">
          გვერდი ვერ მოიძებნა
        </h1>
        <p className="mt-2 text-sm text-white/70">
          მსგავსი კურსი არ არსებობს ან ბმული არასწორია.
        </p>
        <div className="mt-5 flex gap-2">
          <Link href="/courses" className="btn-primary">
            კურსებზე დაბრუნება
          </Link>
          <Link href="/" className="btn-secondary">
            მთავარი გვერდი
          </Link>
        </div>
      </div>
    </main>
  );
}
