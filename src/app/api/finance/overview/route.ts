import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "finance:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 1. Total Income & Sources
    const incomeTransactions = await prisma.financialTransaction.findMany({
      where: { type: "INCOME", status: "COMPLETED" },
    });

    const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
    const donationIncome = incomeTransactions.filter(t => t.source === "DONATION").reduce((acc, t) => acc + t.amount, 0);
    const storeIncome = incomeTransactions.filter(t => t.source === "PRASAD_SALE").reduce((acc, t) => acc + t.amount, 0);
    const sevaIncome = incomeTransactions.filter(t => t.source === "SEVA_BOOKING").reduce((acc, t) => acc + t.amount, 0);

    // 2. Total Expenses
    const expenseTransactions = await prisma.financialTransaction.findMany({
      where: { type: "EXPENSE", status: "COMPLETED" },
    });
    const totalExpenses = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

    // Net Surplus
    const netSurplus = totalIncome - totalExpenses;

    // 3. Recent 10 expenses with categories
    const recentExpenses = await prisma.expense.findMany({
      take: 10,
      orderBy: { paidDate: "desc" },
      include: {
        category: true,
        supplier: true,
        recordedByUser: { select: { name: true } },
      },
    });

    // 4. Expense Categories
    const expenseCategories = await prisma.expenseCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    // 5. Suppliers
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
    });

    return NextResponse.json({
      summary: {
        totalIncome,
        donationIncome,
        storeIncome,
        sevaIncome,
        totalExpenses,
        netSurplus,
      },
      recentExpenses,
      expenseCategories,
      suppliers,
    });
  } catch (err: any) {
    console.error("Finance overview error:", err);
    return NextResponse.json({ error: "Failed to fetch financial overview" }, { status: 500 });
  }
}
