import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { paymentGateway } from "@/lib/payment";

export async function POST(req: NextRequest) {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    const booking = await prisma.sevaBooking.findUnique({
      where: { id: bookingId },
      include: { seva: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isValid = paymentGateway.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      await prisma.sevaBooking.update({
        where: { id: bookingId },
        data: { paymentStatus: "FAILED" },
      });
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const confirmed = await tx.sevaBooking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: "CONFIRMED",
          gatewayPaymentId: razorpayPaymentId,
        },
        include: { seva: true },
      });

      // Post to financial income ledger
      await tx.financialTransaction.create({
        data: {
          transactionNumber: `FT-${Date.now()}-SEVA`,
          type: "INCOME",
          source: "SEVA_BOOKING",
          amount: confirmed.totalAmount,
          paymentMethod: confirmed.paymentMethod,
          referenceId: confirmed.id,
          referenceType: "SevaBooking",
          description: `Seva booking for ${confirmed.seva.name} by ${confirmed.devoteeName} (Pass #${confirmed.bookingNumber})`,
          status: "COMPLETED",
        },
      });

      return confirmed;
    });

    return NextResponse.json({
      success: true,
      booking: updated,
      message: "Seva booking confirmed successfully! Divine blessings await you.",
    });
  } catch (err: any) {
    console.error("Seva payment verify error:", err);
    return NextResponse.json({ error: "Failed to confirm seva booking" }, { status: 500 });
  }
}
