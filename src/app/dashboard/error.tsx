"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container py-10">
      <div className="card p-6">
        <h2 className="text-lg font-semibold">
          დაფიქსირდა შეცდომა დეშბორდში
        </h2>

        <p className="muted mt-2">
          მოხდა გაუთვალისწინებელი შეცდომა. სცადე თავიდან ჩატვირთვა.
        </p>

        <button
          onClick={() => reset()}
          className="btn-primary mt-4"
        >
          ხელახლა ცდა
        </button>
      </div>
    </div>
  );
}