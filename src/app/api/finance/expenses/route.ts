import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "finance:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();
    const { categoryId, title, amount, paymentMethod, supplierId, paidTo, invoiceRef, notes } = data;

    if (!categoryId || !title || !amount || !paidTo) {
      return NextResponse.json({ error: "Category, title, amount, and recipient (paidTo) are required." }, { status: 400 });
    }

    const year = new Date().getFullYear();
    const count = await prisma.expense.count();
    const voucherNumber = `VCH-${year}-${String(count + 1).padStart(4, "0")}`;

    const expense = await prisma.$transaction(async (tx) => {
      const exp = await tx.expense.create({
        data: {
          voucherNumber,
          categoryId,
          title,
          amount: parseFloat(amount),
          paymentMethod: paymentMethod || "BANK_TRANSFER",
          paymentStatus: "PAID",
          supplierId: supplierId || null,
          paidTo,
          invoiceRef: invoiceRef || null,
          notes: notes || null,
          recordedByUserId: user.id,
          approvedByUserId: user.id,
        },
        include: {
          category: true,
          supplier: true,
        },
      });

      // Post to financial transactions double-entry ledger
      await tx.financialTransaction.create({
        data: {
          transactionNumber: `FT-${Date.now()}-EXP`,
          type: "EXPENSE",
          source: supplierId ? "VENDOR_PAYMENT" : "OPERATIONAL_EXPENSE",
          amount: exp.amount,
          paymentMethod: exp.paymentMethod,
          referenceId: exp.id,
          referenceType: "Expense",
          description: `Voucher #${voucherNumber}: ${title} paid to ${paidTo}`,
          status: "COMPLETED",
          recordedByUserId: user.id,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "RECORD_EXPENSE",
          entity: "Expense",
          entityId: exp.id,
          details: JSON.stringify({ voucherNumber, amount: exp.amount, paidTo, title }),
        },
      });

      return exp;
    });

    return NextResponse.json(expense);
  } catch (err: any) {
    console.error("Expense creation error:", err);
    return NextResponse.json({ error: "Failed to record expense voucher" }, { status: 500 });
  }
}
