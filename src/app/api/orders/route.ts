import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, getCurrentDevotee } from "@/lib/auth";
import { paymentGateway } from "@/lib/payment";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderStatus = searchParams.get("orderStatus");
    const myOrdersOnly = searchParams.get("my") === "true";

    const admin = await getCurrentUser();
    const devotee = await getCurrentDevotee();

    let where: any = {};

    if (myOrdersOnly) {
      if (!devotee) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      where.devoteeId = devotee.id;
    } else {
      if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orderStatus) where.orderStatus = orderStatus;

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (err: any) {
    console.error("Orders fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryType, // PICKUP, HOME_DELIVERY
      shippingAddress,
      shippingCity,
      shippingState,
      shippingPincode,
      items, // array of { productId, quantity }
      notes,
    } = data;

    if (!customerName || !customerPhone || !items || !items.length) {
      return NextResponse.json({ error: "Customer details and items are required" }, { status: 400 });
    }

    const devotee = await getCurrentDevotee();

    // Verify stock and calculate totals directly from database records
    let subtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isActive) {
        return NextResponse.json({ error: `Product not found or unavailable.` }, { status: 400 });
      }

      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}` },
          { status: 400 }
        );
      }

      const unitPrice = product.salePrice || product.price;
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        price: unitPrice,
        quantity: item.quantity,
        totalAmount: lineTotal,
      });
    }

    const shippingCost = deliveryType === "PICKUP" ? 0 : subtotal >= 1500 ? 0 : 80;
    const grandTotal = subtotal + shippingCost;

    const count = await prisma.order.count();
    const orderNumber = `ORD-2026-${String(count + 1).padStart(4, "0")}`;

    // Create payment gateway order
    const gatewayOrder = await paymentGateway.createOrder({
      amountInINR: grandTotal,
      receiptId: orderNumber,
      notes: { orderNumber, customerName, customerPhone },
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        devoteeId: devotee?.id || null,
        customerName,
        customerEmail: customerEmail || "",
        customerPhone,
        deliveryType: deliveryType || "PICKUP",
        shippingAddress: deliveryType === "HOME_DELIVERY" ? shippingAddress : null,
        shippingCity: deliveryType === "HOME_DELIVERY" ? shippingCity : null,
        shippingState: deliveryType === "HOME_DELIVERY" ? shippingState : null,
        shippingPincode: deliveryType === "HOME_DELIVERY" ? shippingPincode : null,
        shippingCost,
        subtotal,
        totalAmount: grandTotal,
        paymentMethod: "ONLINE",
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        gatewayOrderId: gatewayOrder.id,
        notes: notes || null,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: true,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      gatewayOrder,
    });
  } catch (err: any) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
