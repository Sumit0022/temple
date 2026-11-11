import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "store:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { orderStatus, trackingNumber, notes } = await req.json();

    const order = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: orderStatus || undefined,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
      include: { orderItems: true },
    });

    // Record in audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE_ORDER_STATUS",
        entity: "Order",
        entityId: order.id,
        details: JSON.stringify({ orderNumber: order.orderNumber, newStatus: orderStatus }),
      },
    });

    return NextResponse.json(order);
  } catch (err: any) {
    console.error("Order status update error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
