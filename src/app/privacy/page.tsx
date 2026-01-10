export default function PrivacyPage() {
  return (
    <main className="container-page section-pad">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-white/95 md:text-3xl">
          კონფიდენციალურობის პოლიტიკა
        </h1>

        <div className="mt-6 space-y-4">
          <div className="card">
            <h2 className="text-lg font-semibold text-white/95">რა მონაცემებს ვაგროვებთ</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              ამ ეტაპზე მინიმუმი: Email და ავტორიზაციისთვის საჭირო მონაცემები. მომავალში დაემატება პროფილის ველები და პროგრესის ჩანაწერები.
            </p>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-white/95">როგორ ვიყენებთ</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              მხოლოდ პლატფორმის მუშაობისთვის: ავტორიზაცია, კურსებზე წვდომა, დეშბორდი და მხარდაჭერა.
            </p>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-white/95">უსაფრთხოება</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              ავთენთიფიკაცია და მონაცემები იმართება Supabase-ით. საბოლოო ვერსიაში დეტალურად დავწერთ შენახვის/წვდომის პოლიტიკას.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
