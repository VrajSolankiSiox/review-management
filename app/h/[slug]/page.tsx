"use client";

import { use, useEffect, useState } from "react";
import { Copy, ExternalLink, Sparkles, Loader2, Star } from "lucide-react";
import { getSavedGoogleReviewUrl, getSavedLinks } from "@/lib/review-links";

const INTERNAL_FEEDBACK_KEY = "internal-feedback";

// const LANGUAGES = ["English", "Gujarati", "Hindi", "Marathi"];

// Updated for Hotels instead of restaurants
const SERVICES = [
  "Clean rooms",
  "Friendly staff",
  "Room service",
  "Central location",
  "Comfortable beds",
  "Great breakfast",
  "Pool",
];

export default function ReviewSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [rating, setRating] = useState(0);
  const [language, setLanguage] = useState("English");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [qrName, setQrName] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadGoogleReviewUrl = async () => {
      const localUrl = getSavedGoogleReviewUrl(slug);
      const localLink = getSavedLinks().find((item) => item.slug === slug);

      if (localLink?.name) {
        setQrName(localLink.name);
      }

      if (localUrl) {
        setGoogleReviewUrl(localUrl);
      }

      try {
        const response = await fetch(
          `/api/review-links/${encodeURIComponent(slug)}`,
        );
        if (!response.ok) return;

        const data = await response.json();
        if (!cancelled) {
          setGoogleReviewUrl(data.googleReviewUrl || localUrl);
          setQrName(data.name || localLink?.name || "");
        }
      } catch {
        if (!cancelled && localUrl) {
          setGoogleReviewUrl(localUrl);
        }
      }
    };

    loadGoogleReviewUrl();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service],
    );
  };

  const handleGenerateAI = async () => {
    if (rating === 0) {
      alert("Please select a star rating first!");
      return;
    }

    setIsGenerating(true);
    try {
      const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
        alert(
          "API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in .env.local",
        );
        setIsGenerating(false);
        return;
      }

      const highlights =
        selectedServices.length > 0
          ? selectedServices.join(", ")
          : "none selected";
      const guestDraft = reviewText.trim() || "Great";

      const prompt = `Rewrite this hotel review so it is medium length, natural, and specific.
      Guest draft: ${guestDraft}
      Rating: ${rating} out of 5 stars.
      Selected highlights: ${highlights}.
      Language: ${language}.
      Use 1 or 2 medium length sentences, maximum 35 words.
      Only mention details from the guest draft or selected highlights.
      Use the rating only to match the tone; do not mention the rating, stars, or score.
      Do not invent plans, future visits, recommendations, travel context, or anything the guest did not say.
      Do not include quotes, a title, or extra commentary.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("API error:", data);
        alert(`Error: ${data.error?.message || "Failed to generate review"}`);
        setIsGenerating(false);
        return;
      }

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        setReviewText(data.candidates[0].content.parts[0].text.trim());
      }
    } catch (error) {
      console.error("Error generating review:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Failed to generate review"}`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const saveInternalFeedback = async () => {
    const feedback = {
      slug,
      rating,
      reviewText,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      services: selectedServices,
      createdAt: new Date().toISOString(),
    };

    try {
      const saved = window.localStorage.getItem(INTERNAL_FEEDBACK_KEY);
      const existing = saved ? JSON.parse(saved) : [];
      window.localStorage.setItem(
        INTERNAL_FEEDBACK_KEY,
        JSON.stringify([feedback, ...existing].slice(0, 50)),
      );
    } catch {
      // The API save below can still succeed if local storage is unavailable.
    }

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
      });

      return response.ok;
    } catch {
      return false;
    }
  };

  const handleCopyAndPost = async () => {
    if (rating === 0) {
      alert("Please select a star rating first!");
      return;
    }

    if (!reviewText.trim()) {
      alert("Please write your review first.");
      return;
    }

    setIsSubmitting(true);

    try {
      await saveInternalFeedback();

      // Always copy the review
      await navigator.clipboard.writeText(reviewText);

      // Always open Google if available
      if (googleReviewUrl) {
        window.open(googleReviewUrl, "_blank");
        alert(
          "Review copied! Paste it into the Google review page that just opened.",
        );
      } else {
        alert("Review copied, but no Google review page is available yet.");
      }

      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="md:min-h-screen h-fit justify-center items-center bg-slate-100 md:p-6 ">
      <div className="mx-auto max-w-xl md:rounded-3xl md:border md:border-slate-200 bg-white p-6 md:shadow-md sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            {qrName || "Share your experience"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">Tell us about your stay</p>
        </div>

        {/* Star Rating */}
        <div className="mb-2 flex justify-center gap-3">
          <div className="mb-8 flex justify-center gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setRating(index + 1)}
                onMouseEnter={() => setHoverRating(index + 1)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                aria-label={`Rate ${index + 1} star`}
              >
                <Star
                  size={40}
                  strokeWidth={2}
                  className={`transition-colors duration-200 ${
                    index < (hoverRating || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-100 text-slate-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="customer-name"
              className="block text-sm font-medium text-slate-700"
            >
              Name
            </label>
            <input
              id="customer-name"
              value={customerName}
              placeholder="John Doe"
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="customer-email"
              className="block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="customer-email"
              type="email"
              placeholder="example@gmail.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Language Selection */}
        {/* <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span>🌐</span> Language
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  language === lang
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div> */}

        {/* Service Highlights */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span>🏨</span> What did you like about your stay?
          </div>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => toggleService(service)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  selectedServices.includes(service)
                    ? "border-indigo-700 bg-indigo-50 text-indigo-900"
                    : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                }`}
              >
                {service}
              </button>
            ))}
          </div>
        </div>

        {/* AI Generation Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-lg bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-200 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGenerating ? "Writing review..." : "Write it for me"}
          </button>
        </div>

        {/* Review Text */}
        <div className="mt-3 space-y-2">
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share details of your own experience at this place..."
            rows={5}
            className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm md:text-md text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
          {/* <div className="flex justify-between items-center text-xs text-slate-500">
            <span>{slug}</span>
            {rating > 0 && <span>{rating}★</span>}
          </div> */}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <button
            onClick={handleCopyAndPost}
            disabled={!reviewText || rating === 0 || isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : googleReviewUrl ? (
              <ExternalLink className="h-5 w-5" />
            ) : (
              <Copy className="h-5 w-5" />
            )}

            {isSubmitting ? "Posting..." : "Copy & Post"}
          </button>
        </div>

        {submitted ? (
          <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-700">
            Thank you! Your feedback has been recorded.
          </p>
        ) : null}
      </div>
    </div>
  );
}
