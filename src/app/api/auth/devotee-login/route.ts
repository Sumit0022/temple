import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword, signDevoteeToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json(); // identifier can be email or phone

    if (!identifier || !password) {
      return NextResponse.json({ error: "Email/Phone and password are required" }, { status: 400 });
    }

    const clean = identifier.trim();
    const devotee = await prisma.devotee.findFirst({
      where: {
        OR: [
          { email: clean.toLowerCase() },
          { phone: clean },
          { phone: clean.replace(/\s+/g, "") },
        ],
      },
    });

    if (!devotee || !devotee.passwordHash) {
      return NextResponse.json({ error: "No registered devotee account found with these details." }, { status: 401 });
    }

    const isMatch = await comparePassword(password, devotee.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const token = signDevoteeToken({
      id: devotee.id,
      email: devotee.email,
      name: devotee.name,
      phone: devotee.phone,
      gotra: devotee.gotra,
    });

    const response = NextResponse.json({
      success: true,
      devotee: {
        id: devotee.id,
        name: devotee.name,
        email: devotee.email,
        phone: devotee.phone,
        gotra: devotee.gotra,
        nakshatra: devotee.nakshatra,
        rashi: devotee.rashi,
        address: devotee.address,
        city: devotee.city,
        state: devotee.state,
        panNumber: devotee.panNumber,
      },
    });

    response.cookies.set("tms_devotee_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Devotee Login Error:", err);
    return NextResponse.json({ error: "Failed to login devotee" }, { status: 500 });
  }
}
