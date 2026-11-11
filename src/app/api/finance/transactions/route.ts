import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "finance:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // INCOME, EXPENSE
    const source = searchParams.get("source");

    const where: any = {};
    if (type) where.type = type;
    if (source) where.source = source;

    const transactions = await prisma.financialTransaction.findMany({
      where,
      orderBy: { transactionDate: "desc" },
      take: 200,
    });

    return NextResponse.json(transactions);
  } catch (err: any) {
    console.error("Finance transactions error:", err);
    return NextResponse.json({ error: "Failed to fetch financial ledger" }, { status: 500 });
  }
}
