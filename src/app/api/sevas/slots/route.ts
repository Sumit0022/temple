import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sevaId = searchParams.get("sevaId");
    const dateStr = searchParams.get("date"); // YYYY-MM-DD

    if (!sevaId || !dateStr) {
      return NextResponse.json({ error: "sevaId and date are required" }, { status: 400 });
    }

    const seva = await prisma.seva.findUnique({
      where: { id: sevaId },
    });

    if (!seva) {
      return NextResponse.json({ error: "Seva not found" }, { status: 404 });
    }

    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all confirmed bookings for this seva on this date
    const bookings = await prisma.sevaBooking.findMany({
      where: {
        sevaId,
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        bookingStatus: { not: "CANCELLED" },
        paymentStatus: { in: ["CONFIRMED", "PENDING"] },
      },
    });

    const bookedCount = bookings.length;
    const remainingSlots = Math.max(0, seva.maxBookingsPerDay - bookedCount);
    const isAvailable = remainingSlots > 0;

    // Split timings string into slots
    const availableTimings = seva.timings.split(",").map((s) => s.trim());

    // Slot count breakdown per timing
    const slotUsage: Record<string, number> = {};
    for (const t of availableTimings) {
      slotUsage[t] = bookings.filter((b) => b.bookingTimeSlot === t).length;
    }

    return NextResponse.json({
      sevaId: seva.id,
      sevaName: seva.name,
      date: dateStr,
      maxBookingsPerDay: seva.maxBookingsPerDay,
      bookedCount,
      remainingSlots,
      isAvailable,
      availableTimings,
      slotUsage,
    });
  } catch (err: any) {
    console.error("Slot availability check error:", err);
    return NextResponse.json({ error: "Failed to check slot availability" }, { status: 500 });
  }
}
