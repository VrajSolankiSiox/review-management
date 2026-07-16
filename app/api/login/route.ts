import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
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

    const existingUser = await query<{ email: string; password: string }>(
      "SELECT email, password FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: "Credentials are wrong. Login unsuccessful." },
        { status: 401 }
      );
    }

    const storedUser = existingUser[0];

    const isPasswordValid = await bcrypt.compare(password, storedUser.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Credentials are wrong. Login unsuccessful." },
        { status: 401 }
      );
    }

    const payload = { user: storedUser.email  };
    const secretKey= process.env.JWTSECRET;

    const token = jwt.sign(payload,secretKey )
    const decoded = jwt.verify(token, secretKey);

    console.log(decoded);
    return NextResponse.json(
      {
        message: "Login successful",
        user: { email, role: "user" },
        token: token
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Something went wrong while processing your request." },
      { status: 500 }
    );
  }
}
