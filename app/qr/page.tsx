"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, ExternalLink, Pencil, Plus, RefreshCw } from "lucide-react";
import {
  fetchSavedReviewLinks,
  getSavedLinks,
  type ReviewLink,
} from "@/lib/review-links";

function formatSavedDate(value?: string) {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function downloadSavedQr(link: ReviewLink) {
  if (!link.qrSvg) return;

  const blob = new Blob([link.qrSvg], { type: "image/svg+xml" });
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `qr-${link.slug || "link"}.svg`;
  downloadLink.click();
  URL.revokeObjectURL(downloadLink.href);
}

export default function QrPage() {
  const [savedLinks, setSavedLinks] = useState<ReviewLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const sortedLinks = useMemo(
    () =>
      [...savedLinks].sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime(),
      ),
    [savedLinks],
  );

  const loadSavedLinks = async () => {
    setIsLoading(true);
    setError("");

    try {
      setSavedLinks(await fetchSavedReviewLinks());
    } catch {
      const localLinks = getSavedLinks();
      setSavedLinks(localLinks);
      setError(
        localLinks.length
          ? "Showing locally saved QR codes because the database could not be reached."
          : "No saved QR codes could be loaded yet.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedLinks();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">QR Codes</h1>
            <p className="mt-1 text-sm text-slate-500">
              Saved QR codes generated for review collection.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadSavedLinks}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={isLoading ? "animate-spin" : undefined}
              />
              Refresh
            </button>

            <Link
              href="/qr/create"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              <Plus size={16} />
              Create QR
            </Link>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Loading saved QR codes...
          </div>
        ) : sortedLinks.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedLinks.map((link) => (
              <article
                key={link.slug}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                    {link.qrSvg ? (
                      <div
                        className="scale-[0.42]"
                        dangerouslySetInnerHTML={{ __html: link.qrSvg }}
                      />
                    ) : (
                      <span className="text-xs font-medium text-slate-400">
                        QR
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold text-slate-900">
                      {link.name || link.slug}
                    </h2>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {link.googleReviewUrl}
                    </p>
                    <p className="mt-3 text-xs text-slate-400">
                      Code {link.slug}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Updated{" "}
                      {formatSavedDate(link.updatedAt || link.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Link
                    href={`/qr/create?slug=${encodeURIComponent(link.slug)}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                  >
                    <Pencil size={15} />
                    Edit
                  </Link>

                  <Link
                    href={link.url}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                  >
                    <ExternalLink size={15} />
                    Preview
                  </Link>

                  <button
                    type="button"
                    onClick={() => downloadSavedQr(link)}
                    disabled={!link.qrSvg}
                    className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:bg-slate-300"
                  >
                    <Download size={15} />
                    Export SVG
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">No saved QR codes yet.</p>
            <Link
              href="/qr/create"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              <Plus size={16} />
              Create QR
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
