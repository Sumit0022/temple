import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signDevoteeToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, phone, email, password, gotra, nakshatra, rashi, address, city, state, pincode, panNumber } = data;

    if (!name || !phone || !password) {
      return NextResponse.json({ error: "Name, mobile phone, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    // Check if phone or email already registered
    const existing = await prisma.devotee.findFirst({
      where: {
        OR: [
          { phone: phone.trim() },
          ...(email ? [{ email: email.toLowerCase().trim() }] : []),
        ],
      },
    });

    if (existing && existing.passwordHash) {
      return NextResponse.json(
        { error: "A devotee account with this mobile phone or email already exists. Please log in." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    let devotee;
    if (existing) {
      // Devotee previously donated as guest, now claiming registered account
      devotee = await prisma.devotee.update({
        where: { id: existing.id },
        data: {
          name,
          email: email ? email.toLowerCase().trim() : existing.email,
          passwordHash,
          gotra: gotra || existing.gotra,
          nakshatra: nakshatra || existing.nakshatra,
          rashi: rashi || existing.rashi,
          address: address || existing.address,
          city: city || existing.city,
          state: state || existing.state,
          pincode: pincode || existing.pincode,
          panNumber: panNumber || existing.panNumber,
          isGuest: false,
        },
      });
    } else {
      devotee = await prisma.devotee.create({
        data: {
          name,
          phone: phone.trim(),
          email: email ? email.toLowerCase().trim() : null,
          passwordHash,
          gotra: gotra || null,
          nakshatra: nakshatra || null,
          rashi: rashi || null,
          address: address || null,
          city: city || null,
          state: state || null,
          pincode: pincode || null,
          panNumber: panNumber ? panNumber.toUpperCase().trim() : null,
          isGuest: false,
        },
      });
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
      message: "Devotee registration completed successfully.",
      devotee: {
        id: devotee.id,
        name: devotee.name,
        phone: devotee.phone,
        email: devotee.email,
      },
    });

    response.cookies.set("tms_devotee_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Devotee Registration Error:", err);
    return NextResponse.json({ error: "Failed to register devotee profile." }, { status: 500 });
  }
}
