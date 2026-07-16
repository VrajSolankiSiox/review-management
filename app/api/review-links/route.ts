import { NextResponse } from "next/server";
import { getUserEmailFromRequest } from "@/lib/auth";
import { query } from "@/lib/postgres";

async function ensureReviewLinksTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS review_links (
      slug TEXT PRIMARY KEY,
      display_name TEXT,
      google_review_url TEXT NOT NULL,
      owner_email TEXT,
      qr_svg TEXT,
      qr_size INTEGER,
      qr_color TEXT,
      qr_background TEXT,
      qr_margin INTEGER,
      container_radius INTEGER,
      qr_module_radius INTEGER,
      qr_module_gap INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const columns = [
    "ADD COLUMN IF NOT EXISTS display_name TEXT",
    "ADD COLUMN IF NOT EXISTS owner_email TEXT",
    "ADD COLUMN IF NOT EXISTS qr_svg TEXT",
    "ADD COLUMN IF NOT EXISTS qr_size INTEGER",
    "ADD COLUMN IF NOT EXISTS qr_color TEXT",
    "ADD COLUMN IF NOT EXISTS qr_background TEXT",
    "ADD COLUMN IF NOT EXISTS qr_margin INTEGER",
    "ADD COLUMN IF NOT EXISTS container_radius INTEGER",
    "ADD COLUMN IF NOT EXISTS qr_module_radius INTEGER",
    "ADD COLUMN IF NOT EXISTS qr_module_gap INTEGER",
  ];

  for (const column of columns) {
    await query(`ALTER TABLE review_links ${column}`);
  }
}

function isValidHotelSlug(slug: string) {
  return /^[a-z0-9]{6,32}$/.test(slug);
}

export async function POST(request: Request) {
  try {
    const ownerEmail = getUserEmailFromRequest(request);

    if (!ownerEmail) {
      return NextResponse.json(
        { error: "You must be logged in to save a QR link." },
        { status: 401 },
      );
    }

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
    } = await request.json();
    const cleanSlug = String(slug || "").trim();
    const cleanName = String(name || "").trim();
    const cleanGoogleReviewUrl = String(googleReviewUrl || "").trim();
    const cleanQrSvg = String(qrSvg || "").trim();
    const numericSize = Number(size);
    const numericQrMargin = Number(qrMargin);
    const numericBorderRadius = Number(borderRadius);
    const numericQrModuleRadius = Number(qrModuleRadius);
    const numericQrModuleGap = Number(qrModuleGap);

    if (!cleanSlug || !cleanName || !cleanGoogleReviewUrl) {
      return NextResponse.json(
        { error: "Name, slug, and Google review URL are required." },
        { status: 400 },
      );
    }

    if (cleanName.length > 80) {
      return NextResponse.json(
        { error: "QR name must be 80 characters or fewer." },
        { status: 400 },
      );
    }

    if (!cleanQrSvg) {
      return NextResponse.json(
        { error: "QR SVG is required." },
        { status: 400 },
      );
    }

    if (!isValidHotelSlug(cleanSlug)) {
      return NextResponse.json(
        { error: "QR slug must be 6 to 32 lowercase letters or numbers." },
        { status: 400 },
      );
    }

    try {
      new URL(cleanGoogleReviewUrl);
    } catch {
      return NextResponse.json(
        { error: "Please enter a valid Google review URL." },
        { status: 400 },
      );
    }

    await ensureReviewLinksTable();

    const rows = await query<{
      slug: string;
      display_name: string | null;
      google_review_url: string;
      qr_svg: string | null;
      qr_size: number | null;
      qr_color: string | null;
      qr_background: string | null;
      qr_margin: number | null;
      container_radius: number | null;
      qr_module_radius: number | null;
      qr_module_gap: number | null;
      created_at: string;
      updated_at: string;
    }>(
      `
        INSERT INTO review_links (
          slug,
          display_name,
          google_review_url,
          owner_email,
          qr_svg,
          qr_size,
          qr_color,
          qr_background,
          qr_margin,
          container_radius,
          qr_module_radius,
          qr_module_gap
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (slug)
        DO UPDATE SET
          display_name = EXCLUDED.display_name,
          google_review_url = EXCLUDED.google_review_url,
          owner_email = EXCLUDED.owner_email,
          qr_svg = EXCLUDED.qr_svg,
          qr_size = EXCLUDED.qr_size,
          qr_color = EXCLUDED.qr_color,
          qr_background = EXCLUDED.qr_background,
          qr_margin = EXCLUDED.qr_margin,
          container_radius = EXCLUDED.container_radius,
          qr_module_radius = EXCLUDED.qr_module_radius,
          qr_module_gap = EXCLUDED.qr_module_gap,
          updated_at = CURRENT_TIMESTAMP
        WHERE review_links.owner_email IS NULL
           OR review_links.owner_email = EXCLUDED.owner_email
        RETURNING
          slug,
          display_name,
          google_review_url,
          qr_svg,
          qr_size,
          qr_color,
          qr_background,
          qr_margin,
          container_radius,
          qr_module_radius,
          qr_module_gap,
          created_at,
          updated_at
      `,
      [
        cleanSlug,
        cleanName,
        cleanGoogleReviewUrl,
        ownerEmail,
        cleanQrSvg,
        Number.isFinite(numericSize) ? numericSize : null,
        String(color || "").trim() || null,
        String(background || "").trim() || null,
        Number.isFinite(numericQrMargin) ? numericQrMargin : null,
        Number.isFinite(numericBorderRadius) ? numericBorderRadius : null,
        Number.isFinite(numericQrModuleRadius) ? numericQrModuleRadius : null,
        Number.isFinite(numericQrModuleGap) ? numericQrModuleGap : null,
      ],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "This QR slug belongs to another user." },
        { status: 409 },
      );
    }

    return NextResponse.json({
      slug: rows[0].slug,
      name: rows[0].display_name || "",
      googleReviewUrl: rows[0].google_review_url,
      qrSvg: rows[0].qr_svg || "",
      size: rows[0].qr_size,
      color: rows[0].qr_color,
      background: rows[0].qr_background,
      qrMargin: rows[0].qr_margin,
      borderRadius: rows[0].container_radius,
      qrModuleRadius: rows[0].qr_module_radius,
      qrModuleGap: rows[0].qr_module_gap,
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at,
    });
  } catch (error) {
    console.error("Review link save error:", error);
    return NextResponse.json(
      { error: "Something went wrong while saving the review link." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const ownerEmail = getUserEmailFromRequest(request);

    if (!ownerEmail) {
      return NextResponse.json(
        { error: "You must be logged in to load saved QR codes." },
        { status: 401 },
      );
    }

    await ensureReviewLinksTable();

    const rows = await query<{
      slug: string;
      display_name: string | null;
      google_review_url: string;
      qr_svg: string | null;
      qr_size: number | null;
      qr_color: string | null;
      qr_background: string | null;
      qr_margin: number | null;
      container_radius: number | null;
      qr_module_radius: number | null;
      qr_module_gap: number | null;
      created_at: string;
      updated_at: string;
    }>(
      `
        SELECT
          slug,
          display_name,
          google_review_url,
          qr_svg,
          qr_size,
          qr_color,
          qr_background,
          qr_margin,
          container_radius,
          qr_module_radius,
          qr_module_gap,
          created_at,
          updated_at
        FROM review_links
        WHERE owner_email = $1
        ORDER BY updated_at DESC
      `,
      [ownerEmail],
    );

    return NextResponse.json({
      links: rows.map((row) => ({
        slug: row.slug,
        name: row.display_name || "",
        googleReviewUrl: row.google_review_url,
        qrSvg: row.qr_svg || "",
        size: row.qr_size,
        color: row.qr_color,
        background: row.qr_background,
        qrMargin: row.qr_margin,
        borderRadius: row.container_radius,
        qrModuleRadius: row.qr_module_radius,
        qrModuleGap: row.qr_module_gap,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  } catch (error) {
    console.error("Review links load error:", error);
    return NextResponse.json(
      { error: "Something went wrong while loading QR codes." },
      { status: 500 },
    );
  }
}
