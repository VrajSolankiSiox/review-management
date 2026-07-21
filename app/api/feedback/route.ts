import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";
import { getUserEmailFromRequest } from "@/lib/auth";

async function ensureFeedbackTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS internal_feedback (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL,
      rating INTEGER NOT NULL,
      review_text TEXT NOT NULL,
      customer_name TEXT,
      customer_email TEXT,
      services JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

type FeedbackRow = {
  id: number;
  slug: string;
  rating: number;
  review_text: string;
  customer_name: string | null;
  customer_email: string | null;
  services: string[] | null;
  created_at: string;
  hotel_name: string | null;
};

export async function GET(request: Request) {
  try {
    const ownerEmail = getUserEmailFromRequest(request);

    if (!ownerEmail) {
      return NextResponse.json(
        { error: "You must be logged in to view reviews." },
        { status: 401 },
      );
    }

    await ensureFeedbackTable();

    const rows = await query<FeedbackRow>(`
      SELECT
        f.id,
        f.slug,
        f.rating,
        f.review_text,
        f.customer_name,
        f.customer_email,
        f.services,
        f.created_at,
        l.display_name AS hotel_name
      FROM internal_feedback f
      INNER JOIN review_links l ON f.slug = l.slug
      WHERE l.owner_email = $1
      ORDER BY f.created_at DESC
    `, [ownerEmail]);

    return NextResponse.json({
      reviews: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        rating: row.rating,
        reviewText: row.review_text,
        customerName: row.customer_name || "",
        customerEmail: row.customer_email || "",
        services: Array.isArray(row.services) ? row.services : [],
        createdAt: row.created_at,
        hotelName: row.hotel_name || "",
      })),
    });
  } catch (error) {
    console.error("Internal feedback load error:", error);
    return NextResponse.json(
      { error: "Something went wrong while loading feedback." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      slug,
      rating,
      reviewText,
      customerName,
      customerEmail,
      services,
    } = await request.json();

    const cleanSlug = String(slug || "").trim();
    const cleanReviewText = String(reviewText || "").trim();
    const cleanCustomerName = String(customerName || "").trim();
    const cleanCustomerEmail = String(customerEmail || "").trim();
    const numericRating = Number(rating);

    if (!cleanSlug || !cleanReviewText || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { error: "Slug, rating, and review text are required." },
        { status: 400 },
      );
    }

    await ensureFeedbackTable();

    const rows = await query<{ id: number; created_at: string }>(
      `
        INSERT INTO internal_feedback (
          slug,
          rating,
          review_text,
          customer_name,
          customer_email,
          services
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb)
        RETURNING id, created_at
      `,
      [
        cleanSlug,
        numericRating,
        cleanReviewText,
        cleanCustomerName || null,
        cleanCustomerEmail || null,
        JSON.stringify(Array.isArray(services) ? services : []),
      ],
    );

    return NextResponse.json({
      id: rows[0].id,
      createdAt: rows[0].created_at,
    });
  } catch (error) {
    console.error("Internal feedback save error:", error);
    return NextResponse.json(
      { error: "Something went wrong while saving feedback." },
      { status: 500 },
    );
  }
}
