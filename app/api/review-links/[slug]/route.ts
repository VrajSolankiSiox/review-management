import { NextResponse } from "next/server";
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

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
        WHERE slug = $1
      `,
      [slug],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Review link not found." },
        { status: 404 },
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
    console.error("Review link lookup error:", error);
    return NextResponse.json(
      { error: "Something went wrong while loading the review link." },
      { status: 500 },
    );
  }
}
