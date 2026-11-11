import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { paymentGateway } from "@/lib/payment";

export async function POST(req: NextRequest) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isValid = paymentGateway.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "FAILED" },
      });
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    // Atomic stock deduction, order confirmation, and financial transaction
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Mark order paid and confirmed
      const confirmedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          orderStatus: "CONFIRMED",
          gatewayPaymentId: razorpayPaymentId,
        },
        include: { orderItems: true },
      });

      // 2. Decrement stock for each product and record inventory movement
      for (const item of order.orderItems) {
        const prod = await tx.product.findUnique({ where: { id: item.productId } });
        if (prod) {
          const newQty = Math.max(0, prod.stockQuantity - item.quantity);
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: newQty },
          });

          await tx.inventoryMovement.create({
            data: {
              productId: prod.id,
              movementType: "OUT_SALE",
              quantity: item.quantity,
              previousStock: prod.stockQuantity,
              newStock: newQty,
              unitCost: prod.price,
              reason: `Sold online via order ${order.orderNumber}`,
              referenceOrderNumber: order.orderNumber,
            },
          });
        }
      }

      // 3. Post income to financial ledger
      await tx.financialTransaction.create({
        data: {
          transactionNumber: `FT-${Date.now()}-STORE`,
          type: "INCOME",
          source: "PRASAD_SALE",
          amount: confirmedOrder.totalAmount,
          paymentMethod: confirmedOrder.paymentMethod,
          referenceId: confirmedOrder.id,
          referenceType: "Order",
          description: `Prasad and devotional store sale order #${confirmedOrder.orderNumber} by ${confirmedOrder.customerName}`,
          status: "COMPLETED",
        },
      });

      return confirmedOrder;
    });

    return NextResponse.json({
      success: true,
      order: updated,
      message: "Order placed and confirmed successfully! May you receive divine blessings.",
    });
  } catch (err: any) {
    console.error("Order verify error:", err);
    return NextResponse.json({ error: "Failed to verify order" }, { status: 500 });
  }
}
