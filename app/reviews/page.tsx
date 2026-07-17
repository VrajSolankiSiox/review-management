"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Star } from "lucide-react";

type Review = {
  id?: number;
  slug: string;
  rating: number;
  reviewText: string;
  customerName: string;
  customerEmail: string;
  services: string[];
  createdAt: string;
};

const LOCAL_FEEDBACK_KEY = "internal-feedback";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getLocalReviews(): Review[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = window.localStorage.getItem(LOCAL_FEEDBACK_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => ({
      slug: String(item.slug || ""),
      rating: Number(item.rating || 0),
      reviewText: String(item.reviewText || ""),
      customerName: String(item.customerName || ""),
      customerEmail: String(item.customerEmail || ""),
      services: Array.isArray(item.services) ? item.services : [],
      createdAt: String(item.createdAt || ""),
    }));
  } catch {
    return [];
  }
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const sortedReviews = useMemo(
    () =>
      [...reviews].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [reviews],
  );

  const loadReviews = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/feedback", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Could not load reviews.");
      }

      const data = await response.json();
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch {
      const localReviews = getLocalReviews();
      setReviews(localReviews);
      setError(
        localReviews.length
          ? "Showing locally saved reviews because the server could not be reached."
          : "Could not load reviews yet.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Reviews</h1>
            <p className="mt-1 text-sm text-slate-500">
              Customer feedback submitted from hotel QR pages.
            </p>
          </div>

          <button
            type="button"
            onClick={loadReviews}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={isLoading ? "animate-spin" : undefined}
            />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  {/* <th className="px-4 py-3">Hotel Slug</th> */}
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Review</th>
                  <th className="px-4 py-3">Highlights</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-slate-500"
                      colSpan={6}
                    >
                      Loading reviews...
                    </td>
                  </tr>
                ) : sortedReviews.length ? (
                  sortedReviews.map((review, index) => (
                    <tr
                      key={
                        review.id ||
                        `${review.slug}-${review.createdAt}-${index}`
                      }
                    >
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                        {formatDate(review.createdAt)}
                      </td>
                      {/* <<td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">
                        {review.slug}
                      </td>> */}
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
                          <Star size={14} fill="currentColor" />
                          {review.rating}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <div className="font-medium text-slate-800">
                          {review.customerName || "Anonymous"}
                        </div>
                        {review.customerEmail ? (
                          <div className="text-xs text-slate-500">
                            {review.customerEmail}
                          </div>
                        ) : null}
                      </td>
                      <td className="max-w-md px-4 py-4 text-slate-700">
                        {review.reviewText}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {review.services.length
                          ? review.services.join(", ")
                          : "None"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-slate-500"
                      colSpan={6}
                    >
                      No reviews submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
