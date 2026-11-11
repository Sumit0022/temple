import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentDevotee } from "@/lib/auth";
import { paymentGateway } from "@/lib/payment";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      sevaId,
      bookingDate,
      bookingTimeSlot,
      devoteeName,
      devoteePhone,
      devoteeEmail,
      gotra,
      nakshatra,
      rashi,
      sankalpa,
      familyMembers,
      numberOfPeople,
      specialInstructions,
    } = data;

    if (!sevaId || !bookingDate || !bookingTimeSlot || !devoteeName || !devoteePhone) {
      return NextResponse.json({ error: "Missing required booking details." }, { status: 400 });
    }

    const seva = await prisma.seva.findUnique({ where: { id: sevaId } });
    if (!seva || !seva.isActive) {
      return NextResponse.json({ error: "Seva not available." }, { status: 400 });
    }

    const devotee = await getCurrentDevotee();

    // Check availability to strictly prevent double booking / overbooking
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingCount = await prisma.sevaBooking.count({
      where: {
        sevaId,
        bookingDate: { gte: startOfDay, lte: endOfDay },
        bookingStatus: { not: "CANCELLED" },
        paymentStatus: { in: ["CONFIRMED", "PENDING"] },
      },
    });

    if (existingCount >= seva.maxBookingsPerDay) {
      return NextResponse.json(
        { error: "Daily capacity reached for this seva on the selected date. Please pick another date." },
        { status: 409 }
      );
    }

    const count = await prisma.sevaBooking.count();
    const bookingNumber = `SB-2026-${String(count + 1).padStart(5, "0")}`;

    // Create payment gateway order
    const gatewayOrder = await paymentGateway.createOrder({
      amountInINR: seva.price,
      receiptId: bookingNumber,
      notes: { bookingNumber, devoteeName, sevaName: seva.name },
    });

    const booking = await prisma.sevaBooking.create({
      data: {
        bookingNumber,
        sevaId,
        devoteeId: devotee?.id || null,
        devoteeName,
        devoteePhone,
        devoteeEmail: devoteeEmail || null,
        gotra: gotra || null,
        nakshatra: nakshatra || null,
        rashi: rashi || null,
        sankalpa: sankalpa || null,
        familyMembers: familyMembers || null,
        bookingDate: new Date(bookingDate),
        bookingTimeSlot,
        numberOfPeople: parseInt(numberOfPeople || 1),
        totalAmount: seva.price,
        paymentMethod: "ONLINE",
        paymentStatus: "PENDING",
        bookingStatus: "CONFIRMED",
        gatewayOrderId: gatewayOrder.id,
        specialInstructions: specialInstructions || null,
      },
      include: {
        seva: true,
      },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      totalAmount: booking.totalAmount,
      gatewayOrder,
    });
  } catch (err: any) {
    console.error("Seva booking error:", err);
    return NextResponse.json({ error: "Failed to initiate seva booking." }, { status: 500 });
  }
}
