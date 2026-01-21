export default function ContactPage() {
  return (
    <main className="container-page section-pad">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold tracking-tight text-white/95 md:text-3xl">
          კონტაქტი
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          დაგვიტოვე შეტყობინება. ამ ეტაპზე ფორმა არის UI დემო (შემდეგ დავუკავშირებთ რეალურ გაგზავნას).
        </p>

        <div className="mt-6 card">
          <form className="space-y-4">
            <div className="space-y-1">
              <input
                id="name"
                name="name"
                type="text"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/45 outline-none transition focus:border-sky-300/40 focus:ring-2 focus:ring-sky-400/20"
                placeholder="შენი სახელი"
              />
            </div>

            <div className="space-y-1">
              <input
                id="email"
                name="email"
                type="email"
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/45 outline-none transition focus:border-indigo-300/40 focus:ring-2 focus:ring-indigo-400/20"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/45 outline-none transition focus:border-sky-300/40 focus:ring-2 focus:ring-sky-400/20"
                placeholder="რას გვკითხავ / რას გვეტყვი?"
              />
            </div>

            <button type="button" className="btn-primary w-full">
              გაგზავნა (Soon)
            </button>

            <p className="text-xs text-white/50">
              რეალური გაგზავნა დავამატებთ: Email provider ან Supabase function.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
