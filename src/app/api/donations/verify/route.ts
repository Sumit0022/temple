import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { paymentGateway } from "@/lib/payment";

export async function POST(req: NextRequest) {
  try {
    const {
      donationId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await req.json();

    if (!donationId) {
      return NextResponse.json({ error: "Missing donation identifier" }, { status: 400 });
    }

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: { category: true },
    });

    if (!donation) {
      return NextResponse.json({ error: "Donation record not found" }, { status: 404 });
    }

    // Verify cryptographic signature from gateway
    const isValid = paymentGateway.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      await prisma.donation.update({
        where: { id: donationId },
        data: { paymentStatus: "FAILED" },
      });
      return NextResponse.json({ error: "Payment verification failed. Invalid signature." }, { status: 400 });
    }

    const transactionId = `TXN-DON-${Date.now()}`;

    // Atomically update donation and post to financial transactions ledger
    const updated = await prisma.$transaction(async (tx) => {
      const updatedDonation = await tx.donation.update({
        where: { id: donationId },
        data: {
          paymentStatus: "SUCCESS",
          paymentGatewayRef: razorpayPaymentId,
          gatewaySignature: razorpaySignature,
          transactionId: transactionId,
        },
        include: { category: true },
      });

      // Post income to double-entry financial ledger
      await tx.financialTransaction.create({
        data: {
          transactionNumber: `FT-${Date.now()}-INC`,
          type: "INCOME",
          source: "DONATION",
          amount: updatedDonation.amount,
          paymentMethod: updatedDonation.paymentMethod,
          referenceId: updatedDonation.id,
          referenceType: "Donation",
          description: `Donation received for ${updatedDonation.category.name} from ${updatedDonation.donorName}`,
          status: "COMPLETED",
        },
      });

      return updatedDonation;
    });

    return NextResponse.json({
      success: true,
      donation: updated,
      message: "Har Har Mahadev! Your divine donation has been received and verified.",
    });
  } catch (err: any) {
    console.error("Donation verification error:", err);
    return NextResponse.json({ error: "Failed to verify donation payment." }, { status: 500 });
  }
}
