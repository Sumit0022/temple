import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // 1. Live Donations Metrics
    const [allDonations, todayDonations, monthDonations] = await Promise.all([
      prisma.donation.findMany({ where: { paymentStatus: "SUCCESS" }, select: { amount: true, categoryId: true } }),
      prisma.donation.findMany({ where: { paymentStatus: "SUCCESS", createdAt: { gte: todayStart } }, select: { amount: true } }),
      prisma.donation.findMany({ where: { paymentStatus: "SUCCESS", createdAt: { gte: monthStart } }, select: { amount: true } }),
    ]);

    const totalDonationsAmount = allDonations.reduce((sum, d) => sum + d.amount, 0);
    const todayDonationsAmount = todayDonations.reduce((sum, d) => sum + d.amount, 0);
    const monthDonationsAmount = monthDonations.reduce((sum, d) => sum + d.amount, 0);

    // Category breakdown
    const categories = await prisma.donationCategory.findMany();
    const categoryBreakdown = categories.map((cat) => {
      const catDonations = allDonations.filter((d) => d.categoryId === cat.id);
      const total = catDonations.reduce((s, d) => s + d.amount, 0);
      return {
        id: cat.id,
        name: cat.name,
        nameHi: cat.nameHi,
        amount: total,
        count: catDonations.length,
      };
    });

    // 2. Store & Orders Metrics
    const [orders, pendingOrders] = await Promise.all([
      prisma.order.findMany({ where: { paymentStatus: "PAID" }, select: { totalAmount: true } }),
      prisma.order.count({ where: { orderStatus: { in: ["PENDING", "CONFIRMED", "PROCESSING"] } } }),
    ]);
    const totalStoreSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    // 3. Devotee & Seva Metrics
    const [totalDevotees, totalBookings, todayBookings] = await Promise.all([
      prisma.devotee.count(),
      prisma.sevaBooking.count({ where: { paymentStatus: "CONFIRMED" } }),
      prisma.sevaBooking.findMany({
        where: {
          bookingDate: { gte: todayStart },
          paymentStatus: "CONFIRMED",
        },
        include: { seva: true },
        take: 5,
      }),
    ]);

    // 4. Inventory Warnings
    const lowStockItems = await prisma.inventoryItem.findMany({
      where: {
        currentStock: { lte: 10 },
      },
      take: 6,
    });

    // 5. Recent Activity Feed (Audit & Transactions)
    const recentAudit = await prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, role: true } } },
    });

    const recentTransactions = await prisma.financialTransaction.findMany({
      take: 8,
      orderBy: { transactionDate: "desc" },
    });

    return NextResponse.json({
      donations: {
        totalAmount: totalDonationsAmount,
        todayAmount: todayDonationsAmount,
        monthAmount: monthDonationsAmount,
        totalCount: allDonations.length,
        categoryBreakdown,
      },
      store: {
        totalSales: totalStoreSales,
        totalOrders: orders.length,
        pendingOrdersCount: pendingOrders,
      },
      sevas: {
        totalBookings,
        todayBookings,
      },
      devotees: {
        totalCount: totalDevotees,
      },
      inventory: {
        lowStockItems,
      },
      recentAudit,
      recentTransactions,
    });
  } catch (err: any) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to generate dashboard statistics" }, { status: 500 });
  }
}
