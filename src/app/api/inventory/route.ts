import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "inventory:read")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [items, suppliers, movements, lowStockCount] = await Promise.all([
      prisma.inventoryItem.findMany({
        include: { supplier: true },
        orderBy: { name: "asc" },
      }),
      prisma.supplier.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.inventoryMovement.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
        include: {
          inventoryItem: true,
          product: true,
          recordedByUser: { select: { id: true, name: true, role: true } },
        },
      }),
      prisma.inventoryItem.count({
        where: {
          currentStock: { lte: prisma.inventoryItem.fields.minStockAlert as any },
        },
      }).catch(() => 0),
    ]);

    return NextResponse.json({ items, suppliers, movements, lowStockCount });
  } catch (err: any) {
    console.error("Inventory fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "inventory:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();
    const { name, category, sku, unit, currentStock, minStockAlert, unitCost, supplierId, location } = data;

    if (!name || !sku) {
      return NextResponse.json({ error: "Name and SKU are required" }, { status: 400 });
    }

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        category: category || "GENERAL_SUPPLY",
        sku: sku.toUpperCase().trim(),
        unit: unit || "units",
        currentStock: parseFloat(currentStock || 0),
        minStockAlert: parseFloat(minStockAlert || 10),
        unitCost: parseFloat(unitCost || 0),
        supplierId: supplierId || null,
        location: location || null,
      },
      include: { supplier: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE_INVENTORY_ITEM",
        entity: "InventoryItem",
        entityId: item.id,
        details: JSON.stringify({ name: item.name, sku: item.sku, stock: item.currentStock }),
      },
    });

    return NextResponse.json(item);
  } catch (err: any) {
    console.error("Create inventory error:", err);
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 });
  }
}
