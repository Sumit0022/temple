import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "donations:write")) {
      return NextResponse.json({ error: "Access denied. Insufficient permissions." }, { status: 403 });
    }

    const data = await req.json();
    const {
      categoryId,
      amount,
      donorName,
      donorPhone,
      donorEmail,
      donorAddress,
      donorPan,
      gotra,
      isAnonymous,
      paymentMethod, // CASH, CHEQUE, UPI, BANK_TRANSFER
      notes,
      isTaxExempt80G,
    } = data;

    if (!categoryId || !amount || amount <= 0 || !donorName || !donorPhone) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    const year = new Date().getFullYear();
    const count = await prisma.donation.count();
    const receiptNumber = `DON-${year}-${String(count + 1).padStart(5, "0")}`;
    const transactionId = `TXN-OFFLINE-${Date.now()}`;

    const tax80GNumber = isTaxExempt80G
      ? process.env.NEXT_PUBLIC_80G_REG_NUMBER || "CIT(E)/AYODHYA/80G/2024/AABTS1234F"
      : null;

    const result = await prisma.$transaction(async (tx) => {
      const donation = await tx.donation.create({
        data: {
          receiptNumber,
          donorName: isAnonymous ? "Anonymous Devotee (गुमनाम भक्त)" : donorName,
          donorEmail: donorEmail || null,
          donorPhone: donorPhone,
          donorAddress: donorAddress || null,
          donorPan: isTaxExempt80G && donorPan ? donorPan.toUpperCase().trim() : null,
          gotra: gotra || null,
          isAnonymous: !!isAnonymous,
          categoryId,
          amount: parseFloat(amount),
          paymentMethod: paymentMethod || "CASH",
          paymentStatus: "SUCCESS",
          transactionId,
          isTaxExempt80G: !!isTaxExempt80G,
          tax80GNumber,
          notes: notes || `Offline ${paymentMethod || "CASH"} donation recorded by ${user.name}`,
          createdByUserId: user.id,
        },
        include: { category: true },
      });

      // Post to financial transactions ledger
      await tx.financialTransaction.create({
        data: {
          transactionNumber: `FT-${Date.now()}-INC`,
          type: "INCOME",
          source: "DONATION",
          amount: donation.amount,
          paymentMethod: donation.paymentMethod,
          referenceId: donation.id,
          referenceType: "Donation",
          description: `Offline donation received for ${donation.category.name} from ${donation.donorName}`,
          status: "COMPLETED",
          recordedByUserId: user.id,
        },
      });

      // Log in AuditLog
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "RECORD_OFFLINE_DONATION",
          entity: "Donation",
          entityId: donation.id,
          details: JSON.stringify({ receiptNumber, amount, method: paymentMethod, donor: donation.donorName }),
          ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
          userAgent: req.headers.get("user-agent"),
        },
      });

      return donation;
    });

    return NextResponse.json({
      success: true,
      donation: result,
      message: `Offline donation receipt ${receiptNumber} generated successfully.`,
    });
  } catch (err: any) {
    console.error("Offline donation recording error:", err);
    return NextResponse.json({ error: "Failed to record offline donation" }, { status: 500 });
  }
}
