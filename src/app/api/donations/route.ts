import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, getCurrentDevotee } from "@/lib/auth";
import { paymentGateway } from "@/lib/payment";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const paymentStatus = searchParams.get("paymentStatus");
    const paymentMethod = searchParams.get("paymentMethod");
    const search = searchParams.get("search");
    const myDonationsOnly = searchParams.get("my") === "true";

    const admin = await getCurrentUser();
    const devotee = await getCurrentDevotee();

    // If requesting my donations as a logged in devotee
    let whereClause: any = {};

    if (myDonationsOnly) {
      if (!devotee) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      whereClause.devoteeId = devotee.id;
    } else {
      // Admin route access check
      if (!admin) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
      }
    }

    if (categoryId) whereClause.categoryId = categoryId;
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;
    if (paymentMethod) whereClause.paymentMethod = paymentMethod;

    if (search) {
      whereClause.OR = [
        { donorName: { contains: search } },
        { receiptNumber: { contains: search } },
        { donorPhone: { contains: search } },
        { donorEmail: { contains: search } },
        { donorPan: { contains: search } },
      ];
    }

    const donations = await prisma.donation.findMany({
      where: whereClause,
      include: {
        category: true,
        createdByUser: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(donations);
  } catch (err: any) {
    console.error("Donations list error:", err);
    return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
      isTaxExempt80G,
    } = data;

    if (!categoryId || !amount || amount <= 0 || !donorName || !donorPhone) {
      return NextResponse.json({ error: "Please provide valid donor details and amount." }, { status: 400 });
    }

    const devotee = await getCurrentDevotee();

    // Generate unique preliminary receipt number
    const year = new Date().getFullYear();
    const count = await prisma.donation.count();
    const receiptNumber = `DON-${year}-${String(count + 1).padStart(5, "0")}`;

    // Get 80G tax settings
    const tax80GNumber = isTaxExempt80G
      ? process.env.NEXT_PUBLIC_80G_REG_NUMBER || "CIT(E)/AYODHYA/80G/2024/AABTS1234F"
      : null;

    // Call payment gateway service
    const gatewayOrder = await paymentGateway.createOrder({
      amountInINR: amount,
      receiptId: receiptNumber,
      notes: {
        donorName,
        donorPhone,
        categoryId,
      },
    });

    const donation = await prisma.donation.create({
      data: {
        receiptNumber,
        devoteeId: devotee?.id || null,
        donorName: isAnonymous ? "Anonymous Devotee (गुमनाम भक्त)" : donorName,
        donorEmail: donorEmail || null,
        donorPhone: donorPhone,
        donorAddress: donorAddress || null,
        donorPan: isTaxExempt80G && donorPan ? donorPan.toUpperCase().trim() : null,
        gotra: gotra || null,
        isAnonymous: !!isAnonymous,
        categoryId,
        amount: parseFloat(amount),
        paymentMethod: "ONLINE",
        paymentStatus: "PENDING",
        gatewayOrderId: gatewayOrder.id,
        isTaxExempt80G: !!isTaxExempt80G,
        tax80GNumber,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      donationId: donation.id,
      receiptNumber: donation.receiptNumber,
      gatewayOrder,
    });
  } catch (err: any) {
    console.error("Donation creation error:", err);
    return NextResponse.json({ error: "Failed to initiate donation process." }, { status: 500 });
  }
}
