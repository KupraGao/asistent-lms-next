export default function TermsPage() {
  return (
    <main className="container-page section-pad">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-white/95 md:text-3xl">
          გამოყენების წესები
        </h1>

        <div className="mt-6 space-y-4">
          <div className="card">
            <h2 className="text-lg font-semibold text-white/95">1) ზოგადი</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              ეს არის დროებითი ტექსტი (placeholder). შემდეგ ეტაპზე დავწერთ სრულ პირობებს: ანგარიშის გამოყენება,
              კონტენტის ხელმისაწვდომობა, აკრძალვები და პასუხისმგებლობა.
            </p>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-white/95">2) კონტენტის გამოყენება</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              კურსის მასალები არის პლატფორმის შიგნით გამოსაყენებლად. გადმოწერა/გავრცელება დარეგულირდება საბოლოო წესებით.
            </p>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-white/95">3) ცვლილებები</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              წესები შეიძლება განახლდეს. საბოლოო ვერსიას დავამატებთ გამოქვეყნების თარიღით.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
