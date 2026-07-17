import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const secretKey = process.env.JWTSECRET as string;
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, secretKey);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const email = decoded.user;
    if (!email) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    const { firstName, lastName } = await request.json();

    if (!firstName) {
      return NextResponse.json(
        { error: "First name is required." },
        { status: 400 }
      );
    }

    const fullName = [firstName.trim(), lastName?.trim()].filter(Boolean).join(" ");

    await query(
      "UPDATE users SET full_name = $1 WHERE email = $2",
      [fullName, email]
    );

    // Re-issue JWT with updated full_name
    const newPayload = { user: email, full_name: fullName };
    const newToken = jwt.sign(newPayload, secretKey);

    return NextResponse.json(
      { 
        message: "Profile updated successfully",
        token: newToken
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update API error:", error);
    return NextResponse.json(
      { error: "Something went wrong while processing your request." },
      { status: 500 }
    );
  }
}
