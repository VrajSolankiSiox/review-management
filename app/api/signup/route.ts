import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";

export async function POST(request: Request) {
  try {
    const { fullName, email, password } = await request.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Full name, email, and password are required." },
        { status: 400 }
      );
    }

    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS full_name TEXT
    `);

    const existingUser = await query<{ email: string }>(
      "SELECT email FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User already exists. Please login instead." },
        { status: 409 }
      );
    }

    await query(
      "INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3)",
      [fullName, email, password]
    );

    return NextResponse.json(
      {
        message: "Signup successful",
        user: { fullName, email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup API error:", error);
    return NextResponse.json(
      { error: "Something went wrong while creating your account." },
      { status: 500 }
    );
  }
}
