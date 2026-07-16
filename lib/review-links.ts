const STORAGE_KEY = "review-links";

export function getReviewBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_REVIEW_BASE_URL?.trim();
  const fallbackUrl = typeof window === "undefined" ? "" : window.location.origin;
  const baseUrl = configuredUrl || fallbackUrl;

  return baseUrl.replace(/\/+$/, "");
}

export function getReviewPageUrl(slug: string) {
  const baseUrl = getReviewBaseUrl();

  return baseUrl ? `${baseUrl}/h/${slug}` : `/h/${slug}`;
}

export type ReviewLink = {
  slug: string;
  name?: string;
  url: string;
  googleReviewUrl: string;
  createdAt: string;
  updatedAt?: string;
  qrSvg?: string;
  size?: number;
  color?: string;
  background?: string;
  qrMargin?: number;
  borderRadius?: number;
  qrModuleRadius?: number;
  qrModuleGap?: number;
};

export function getSavedLinks(): ReviewLink[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export type SaveReviewLinkInput = {
  slug: string;
  name: string;
  googleReviewUrl: string;
  qrSvg: string;
  size: number;
  color: string;
  background: string;
  qrMargin: number;
  borderRadius: number;
  qrModuleRadius: number;
  qrModuleGap: number;
};

export async function saveReviewLink(input: SaveReviewLinkInput) {
  const {
    slug,
    name,
    googleReviewUrl,
    qrSvg,
    size,
    color,
    background,
    qrMargin,
    borderRadius,
    qrModuleRadius,
    qrModuleGap,
  } = input;
  const url = getReviewPageUrl(slug);
  const link = {
    slug,
    name,
    url,
    googleReviewUrl,
    createdAt: new Date().toISOString(),
    qrSvg,
    size,
    color,
    background,
    qrMargin,
    borderRadius,
    qrModuleRadius,
    qrModuleGap,
  };

  if (typeof window === "undefined") return { ...link, synced: false };

  const links = getSavedLinks();
  const nextLinks = [
    link,
    ...links.filter((item) => item.slug !== slug),
  ].slice(0, 10);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLinks));

  try {
    const response = await fetch("/api/review-links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.localStorage.getItem("JWT") || ""}`,
      },
      body: JSON.stringify(input),
    });

    return { ...link, synced: response.ok };
  } catch {
    return { ...link, synced: false };
  }
}

export function getSavedGoogleReviewUrl(slug: string) {
  return getSavedLinks().find((item) => item.slug === slug)?.googleReviewUrl || "";
}

export async function fetchSavedReviewLinks() {
  if (typeof window === "undefined") return [];

  const response = await fetch("/api/review-links", {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem("JWT") || ""}`,
    },
  });

  if (!response.ok) {
    throw new Error("Could not load saved QR codes.");
  }

  const data = await response.json();
  const links = Array.isArray(data.links) ? (data.links as ReviewLink[]) : [];

  return links.map((item) => ({
    ...item,
    url: getReviewPageUrl(item.slug),
  }));
}

export async function fetchReviewLink(slug: string) {
  if (typeof window === "undefined") return null;

  const response = await fetch(`/api/review-links/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load QR code.");
  }

  const item = (await response.json()) as ReviewLink;

  return {
    ...item,
    url: getReviewPageUrl(item.slug),
  };
}
