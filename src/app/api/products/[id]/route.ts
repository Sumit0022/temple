import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "store:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const data = await req.json();

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        nameHi: data.nameHi,
        price: data.price !== undefined ? parseFloat(data.price) : undefined,
        salePrice: data.salePrice !== undefined ? (data.salePrice ? parseFloat(data.salePrice) : null) : undefined,
        stockQuantity: data.stockQuantity !== undefined ? parseInt(data.stockQuantity) : undefined,
        minStockThreshold: data.minStockThreshold !== undefined ? parseInt(data.minStockThreshold) : undefined,
        description: data.description,
        descriptionHi: data.descriptionHi,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
      },
      include: { category: true },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Update product error:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "store:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Product deactivated successfully" });
  } catch (err: any) {
    console.error("Delete product error:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
