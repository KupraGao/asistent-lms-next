import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="container-page section-pad">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-white/95 md:text-3xl">
          ჩვენს შესახებ
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          Asistent LMS არის ციფრული სასწავლო პლატფორმა, რომელიც გაძლევს მკაფიო სტრუქტურას, პრაქტიკულ დავალებებს
          და პროგრესის კონტროლს. მიზანია სწავლა იყოს სისტემური და შედეგზე ორიენტირებული.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-white/95">რას მიიღებ</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• თემებად დალაგებული პროგრამა</li>
              <li>• პრაქტიკული დავალებები</li>
              <li>• პროგრესის ჩანიშვნა და სტატუსები</li>
              <li>• დეშბორდი და პირადი კაბინეტი</li>
            </ul>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-white/95">როგორ ვითარდება</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              ახლა ვაკეთებთ Front-end UI-ს და Auth flow-ს. შემდეგ ეტაპზე დაემატება:
              გადახდები, lesson gating, კურსის სრული კონტენტი, ტესტები და ადმინისტრატორის პანელი.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link className="btn-primary" href="/courses">
            კურსების ნახვა
          </Link>
          <Link className="btn-secondary" href="/contact">
            კონტაქტი
          </Link>
        </div>
      </div>
    </main>
  );
}
