import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, getCurrentDevotee } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const sevaId = searchParams.get("sevaId");
    const myBookingsOnly = searchParams.get("my") === "true";

    const admin = await getCurrentUser();
    const devotee = await getCurrentDevotee();

    let where: any = {};

    if (myBookingsOnly) {
      if (!devotee) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      where.devoteeId = devotee.id;
    } else {
      if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sevaId) where.sevaId = sevaId;

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.bookingDate = { gte: startOfDay, lte: endOfDay };
    }

    const bookings = await prisma.sevaBooking.findMany({
      where,
      include: {
        seva: true,
      },
      orderBy: [{ bookingDate: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(bookings);
  } catch (err: any) {
    console.error("Fetch seva bookings error:", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
