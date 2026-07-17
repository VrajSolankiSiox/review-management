"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Sliders,
  Palette,
  Link as LinkIcon,
  Save,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import {
  fetchReviewLink,
  getReviewPageUrl,
  getSavedLinks,
  saveReviewLink,
} from "@/lib/review-links";

const PRESET_COLORS = [
  "#000000",
  "#0f766e",
  "#2563eb",
  "#4f46e5",
  "#db2777",
  "#ea580c",
  "#16a34a",
];

type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

type QrModules = {
  size: number;
  data: Uint8Array;
};

function createRandomSlug() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(8);

  if (typeof crypto !== "undefined") {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function isFinderPatternModule(
  row: number,
  column: number,
  moduleCount: number,
) {
  const inTop = row < 7;
  const inLeft = column < 7;
  const inRight = column >= moduleCount - 7;
  const inBottom = row >= moduleCount - 7;

  return (inTop && inLeft) || (inTop && inRight) || (inBottom && inLeft);
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Palette size={16} className="text-slate-500" />
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
              value === preset
                ? "scale-110 border-slate-400 shadow-sm"
                : "border-transparent"
            }`}
            style={{ backgroundColor: preset }}
            aria-label={`Select ${preset}`}
          />
        ))}
        <div className="ml-2 flex items-center">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-8 cursor-pointer overflow-hidden rounded-full border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="ml-3 w-24 rounded-lg border border-slate-200 px-2 py-1 text-sm font-mono uppercase"
          />
        </div>
      </div>
    </div>
  );
}

function createRoundedQrSvg({
  value,
  size,
  margin,
  color,
  background,
  moduleRadius,
  moduleGap,
}: {
  value: string;
  size: number;
  margin: number;
  color: string;
  background: string;
  moduleRadius: number;
  moduleGap: number;
}) {
  const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
  const modules = qr.modules as QrModules;
  const moduleCount = modules.size;
  const safeSize = Math.max(120, Math.min(400, size));
  const totalModules = moduleCount + margin * 2;
  const cellSize = safeSize / totalModules;
  const gapSize = cellSize * (Math.max(0, Math.min(40, moduleGap)) / 100);
  const moduleSize = cellSize - gapSize;
  const moduleOffset = gapSize / 2;
  const radius = moduleSize * (moduleRadius / 100);

  const finderPositions = [
    [0, 0],
    [moduleCount - 7, 0],
    [0, moduleCount - 7],
  ];

  const finderPatterns = finderPositions
    .map(([column, row]) => {
      const x = (column + margin) * cellSize;
      const y = (row + margin) * cellSize;
      const outerSize = 7 * cellSize;
      const middleOffset = cellSize;
      const middleSize = 5 * cellSize;
      const innerOffset = 2 * cellSize;
      const innerSize = 3 * cellSize;
      const eyeRadius = Math.max(2, cellSize * 1.3);

      return [
        `<rect x="${x}" y="${y}" width="${outerSize}" height="${outerSize}" rx="${eyeRadius}" ry="${eyeRadius}" fill="${color}" />`,
        `<rect x="${x + middleOffset}" y="${y + middleOffset}" width="${middleSize}" height="${middleSize}" rx="${eyeRadius * 0.7}" ry="${eyeRadius * 0.7}" fill="${background}" />`,
        `<rect x="${x + innerOffset}" y="${y + innerOffset}" width="${innerSize}" height="${innerSize}" rx="${eyeRadius * 0.45}" ry="${eyeRadius * 0.45}" fill="${color}" />`,
      ].join("");
    })
    .join("");

  const rects = Array.from(modules.data)
    .map((isDark, index) => {
      if (!isDark) return "";

      const row = Math.floor(index / moduleCount);
      const column = index % moduleCount;
      if (isFinderPatternModule(row, column, moduleCount)) return "";

      const x = (column + margin) * cellSize + moduleOffset;
      const y = (row + margin) * cellSize + moduleOffset;

      return `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" rx="${radius}" ry="${radius}" fill="${color}" />`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${safeSize}" height="${safeSize}" viewBox="0 0 ${safeSize} ${safeSize}" role="img"><rect width="100%" height="100%" fill="${background}" />${rects}${finderPatterns}</svg>`;
}

export default function CreateQrPage() {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("slug") || "";
  const [slug, setSlug] = useState(() => createRandomSlug());
  const [name, setName] = useState("");
  const [size, setSize] = useState(220);
  const [color, setColor] = useState("#0f766e");
  const [background, setBackground] = useState("#ffffff");
  const [qrMargin, setQrMargin] = useState(2);
  const [borderRadius, setBorderRadius] = useState(16);
  const [qrModuleRadius, setQrModuleRadius] = useState(0);
  const [qrModuleGap, setQrModuleGap] = useState(0);
  const [qrSvg, setQrSvg] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const url = useMemo(() => {
    return slug ? getReviewPageUrl(slug) : getReviewPageUrl("");
  }, [slug]);

  useEffect(() => {
    try {
      setQrSvg(
        createRoundedQrSvg({
          value: url,
          size,
          margin: qrMargin,
          color,
          background,
          moduleRadius: qrModuleRadius,
          moduleGap: qrModuleGap,
        }),
      );
    } catch {
      setQrSvg("");
    }
  }, [background, color, size, url, qrMargin, qrModuleRadius, qrModuleGap]);

  useEffect(() => {
    if (!editSlug) return;

    let cancelled = false;

    const loadEditableQr = async () => {
      const localLink = getSavedLinks().find((item) => item.slug === editSlug);

      if (localLink && !cancelled) {
        setSlug(localLink.slug);
        setName(localLink.name || "");
        setGoogleReviewUrl(localLink.googleReviewUrl);
        setSize(localLink.size || 220);
        setColor(localLink.color || "#0f766e");
        setBackground(localLink.background || "#ffffff");
        setQrMargin(localLink.qrMargin ?? 2);
        setBorderRadius(localLink.borderRadius ?? 16);
        setQrModuleRadius(localLink.qrModuleRadius ?? 0);
        setQrModuleGap(localLink.qrModuleGap ?? 0);
      }

      try {
        const savedLink = await fetchReviewLink(editSlug);
        if (!savedLink || cancelled) return;

        setSlug(savedLink.slug);
        setName(savedLink.name || "");
        setGoogleReviewUrl(savedLink.googleReviewUrl);
        setSize(savedLink.size || 220);
        setColor(savedLink.color || "#0f766e");
        setBackground(savedLink.background || "#ffffff");
        setQrMargin(savedLink.qrMargin ?? 2);
        setBorderRadius(savedLink.borderRadius ?? 16);
        setQrModuleRadius(savedLink.qrModuleRadius ?? 0);
        setQrModuleGap(savedLink.qrModuleGap ?? 0);
        // setSaveMessage(`Editing saved QR code ${savedLink.slug}.`);
      } catch {
        if (!localLink && !cancelled) {
          setSaveMessage("Could not load that saved QR code.");
        }
      }
    };

    loadEditableQr();

    return () => {
      cancelled = true;
    };
  }, [editSlug]);

  const downloadQr = () => {
    const blob = new Blob([qrSvg], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `qr-${slug || "link"}.svg`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleSave = async () => {
    const cleanName = name.trim();
    const cleanGoogleReviewUrl = googleReviewUrl.trim();

    if (!slug || !cleanName || !cleanGoogleReviewUrl) {
      setSaveMessage("Add a name and Google review page link.");
      return;
    }

    if (cleanName.length > 80) {
      setSaveMessage("Keep the QR name under 80 characters.");
      return;
    }

    if (!cleanGoogleReviewUrl) {
      setSaveMessage("Add a Google review page link.");
      return;
    }

    try {
      new URL(cleanGoogleReviewUrl);
    } catch {
      setSaveMessage("Enter a valid Google review page link.");
      return;
    }

    try {
      const savedLink = await saveReviewLink({
        slug,
        name: cleanName,
        googleReviewUrl: cleanGoogleReviewUrl,
        qrSvg,
        size,
        color,
        background,
        qrMargin,
        borderRadius,
        qrModuleRadius,
        qrModuleGap,
      });
      setSaveMessage(
        savedLink.synced
          ? "Saved QR code to the database."
          : "Saved QR code locally. Log in and try again to sync it to the database.",
      );
    } catch {
      setSaveMessage("Could not save the Google review link.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-800">
      <div className=" flex max-w-6xl flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row">
        {/* Left Column: Controls */}
        <div className="flex-1 space-y-8">
          <div>
            <Link
              href="/qr"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Saved QR codes
            </Link>
            <h1 className="text-2xl font-semibold">
              {editSlug ? "Edit QR Code" : "QR Code Creator"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Customize your QR code appearance and settings below.
            </p>
          </div>

          <div className="space-y-6">
            {/* Link Section */}
            <div className="space-y-4 rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <label className="flex items-center gap-2 text-sm font-medium">
                <LinkIcon size={16} className="text-slate-500" />
                Link Details
              </label>

              <div>
                <span className="text-xs text-slate-500 mb-1 block">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Hotel name or location"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <span className="text-xs text-slate-500 mb-1 block">
                  Google Business review page link
                </span>
                <input
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  placeholder="https://g.page/r/..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Visual Settings */}
            <div className="space-y-6 rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Sliders size={16} className="text-slate-500" />
                Visual Settings
              </label>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Size ({size}px)
                  <input
                    type="range"
                    min="160"
                    max="400"
                    step="10"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="mt-2 w-full accent-emerald-600"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Quiet Zone / Margin ({qrMargin})
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={qrMargin}
                    onChange={(e) => setQrMargin(Number(e.target.value))}
                    className="mt-2 w-full accent-emerald-600"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  Container Radius ({borderRadius}px)
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(Number(e.target.value))}
                    className="mt-2 w-full accent-emerald-600"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  QR Code Radius ({qrModuleRadius}%)
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={qrModuleRadius}
                    onChange={(e) => setQrModuleRadius(Number(e.target.value))}
                    className="mt-2 w-full accent-emerald-600"
                  />
                </label>

                <label className="text-sm font-medium text-slate-700">
                  QR Code Gap ({qrModuleGap}%)
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={qrModuleGap}
                    onChange={(e) => setQrModuleGap(Number(e.target.value))}
                    className="mt-2 w-full accent-emerald-600"
                  />
                </label>
              </div>
            </div>

            {/* Colors Section */}
            <div className="space-y-6 rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <ColorPicker
                label="QR Code Color"
                value={color}
                onChange={setColor}
              />
              <div className="h-px w-full bg-slate-200" />
              <ColorPicker
                label="Background Color"
                value={background}
                onChange={setBackground}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.open(url, "_blank")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <LinkIcon size={18} /> Preview
              </button>

              {/* <button
                onClick={() => {
                  setSlug(createRandomSlug());
                  setName("");
                  setGoogleReviewUrl("");
                  setSaveMessage("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-3 font-medium text-white transition-colors hover:bg-slate-600"
              >
                <RefreshCw size={18} /> New QR Code
              </button> */}

              <button
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 font-medium text-white transition-colors hover:bg-slate-700"
              >
                <Save size={18} /> Save
              </button>

              <button
                onClick={downloadQr}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-700"
              >
                <Download size={18} /> Export SVG
              </button>
            </div>

            {saveMessage ? (
              <p className="text-sm text-emerald-700">{saveMessage}</p>
            ) : null}
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="flex min-h-100 flex-1 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 p-8">
          <div
            className="bg-white shadow-xl transition-all duration-300 flex items-center justify-center relative group"
            style={{
              borderRadius: `${borderRadius}px`,
              overflow: "hidden",
              backgroundColor: background,
            }}
          >
            {qrSvg ? (
              <div
                dangerouslySetInnerHTML={{ __html: qrSvg }}
                className="transition-transform duration-300  "
                style={{ display: "flex" }} // Removes random bottom padding from inline SVGs
              />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center">
                <p className="text-sm text-slate-500">Generating...</p>
              </div>
            )}
          </div>
          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Live Preview
          </p>
        </div>
      </div>
    </div>
  );
}
