import { NextResponse } from "next/server";
import { query } from "@/lib/postgres";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    const existingUser = await query<{ password: string }>(
      "SELECT password FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const storedUser = existingUser[0];
    const isPasswordValid = await bcrypt.compare(currentPassword, storedUser.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect current password." },
        { status: 401 }
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await query(
      "UPDATE users SET password = $1 WHERE email = $2",
      [hashedNewPassword, email]
    );

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset API error:", error);
    return NextResponse.json(
      { error: "Something went wrong while processing your request." },
      { status: 500 }
    );
  }
}
