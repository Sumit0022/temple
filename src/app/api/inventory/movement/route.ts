import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "inventory:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { inventoryItemId, movementType, quantity, unitCost, reason } = await req.json();

    if (!inventoryItemId || !movementType || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id: inventoryItemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const qty = parseFloat(quantity);
    let newStock = item.currentStock;

    if (movementType === "IN_PURCHASE") {
      newStock += qty;
    } else if (movementType === "OUT_SALE" || movementType === "OUT_PRASAD_SEVA" || movementType === "DAMAGED_EXPIRED") {
      newStock = Math.max(0, item.currentStock - qty);
    } else if (movementType === "ADJUSTMENT") {
      newStock = qty; // direct adjustment sets stock
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.inventoryItem.update({
        where: { id: inventoryItemId },
        data: {
          currentStock: newStock,
          unitCost: unitCost !== undefined ? parseFloat(unitCost) : item.unitCost,
        },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          inventoryItemId,
          movementType,
          quantity: qty,
          previousStock: item.currentStock,
          newStock,
          unitCost: unitCost ? parseFloat(unitCost) : item.unitCost,
          reason: reason || "Stock adjusted by inventory manager",
          recordedByUserId: user.id,
        },
        include: {
          inventoryItem: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "INVENTORY_MOVEMENT",
          entity: "InventoryItem",
          entityId: item.id,
          details: JSON.stringify({ type: movementType, qty, previous: item.currentStock, new: newStock, reason }),
        },
      });

      return movement;
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Inventory movement error:", err);
    return NextResponse.json({ error: "Failed to record stock movement" }, { status: 500 });
  }
}
