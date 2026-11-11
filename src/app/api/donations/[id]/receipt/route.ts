import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const donation = await prisma.donation.findFirst({
      where: {
        OR: [{ id: id }, { receiptNumber: id }],
      },
      include: {
        category: true,
      },
    });

    if (!donation) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    const settings = await prisma.templeSetting.findMany({
      where: {
        key: {
          in: ["TEMPLE_NAME", "TEMPLE_TRUST_NAME", "TRUST_REG_NUMBER", "TEMPLE_ADDRESS"],
        },
      },
    });

    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      receiptNumber: donation.receiptNumber,
      transactionId: donation.transactionId,
      date: new Date(donation.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      donorName: donation.donorName,
      donorPhone: donation.donorPhone,
      donorEmail: donation.donorEmail,
      donorPan: donation.donorPan,
      gotra: donation.gotra,
      donorAddress: donation.donorAddress,
      categoryName: donation.category.name,
      amount: donation.amount,
      paymentMethod: donation.paymentMethod,
      isTaxExempt80G: donation.isTaxExempt80G,
      tax80GNumber: donation.tax80GNumber,
      templeName: settingsMap.TEMPLE_NAME,
      trustName: settingsMap.TEMPLE_TRUST_NAME,
      trustRegNumber: settingsMap.TRUST_REG_NUMBER,
      templeAddress: settingsMap.TEMPLE_ADDRESS,
    });
  } catch (err: any) {
    console.error("Receipt fetch error:", err);
    return NextResponse.json({ error: "Failed to generate receipt details." }, { status: 500 });
  }
}
