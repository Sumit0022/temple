import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.donationCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(categories);
  } catch (err: any) {
    console.error("Donation categories fetch error:", err);
    return NextResponse.json({ error: "Failed to load donation categories" }, { status: 500 });
  }
}
