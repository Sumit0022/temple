import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const isPrasad = searchParams.get("isPrasad");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");

    const where: any = { isActive: true };

    if (category) {
      where.category = { slug: category };
    }
    if (isPrasad !== null && isPrasad !== undefined && isPrasad !== "") {
      where.isPrasad = isPrasad === "true";
    }
    if (featured === "true") {
      where.isFeatured = true;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameHi: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      }),
      prisma.productCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    return NextResponse.json({ products, categories });
  } catch (err: any) {
    console.error("Products fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "store:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();
    const {
      name,
      nameHi,
      categoryId,
      description,
      descriptionHi,
      price,
      salePrice,
      sku,
      stockQuantity,
      minStockThreshold,
      isPrasad,
      shelfLifeDays,
      weightGrams,
      images,
    } = data;

    if (!name || !categoryId || !price || !sku) {
      return NextResponse.json({ error: "Name, category, price, and SKU are required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + `-${Date.now().toString().slice(-4)}`;

    const product = await prisma.product.create({
      data: {
        name,
        nameHi: nameHi || name,
        slug,
        categoryId,
        description: description || "",
        descriptionHi: descriptionHi || "",
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        sku: sku.toUpperCase().trim(),
        stockQuantity: parseInt(stockQuantity || 0),
        minStockThreshold: parseInt(minStockThreshold || 5),
        isPrasad: !!isPrasad,
        shelfLifeDays: shelfLifeDays ? parseInt(shelfLifeDays) : null,
        weightGrams: weightGrams ? parseInt(weightGrams) : null,
        images: Array.isArray(images) ? JSON.stringify(images) : JSON.stringify([images || "/placeholder-prasad.jpg"]),
      },
      include: { category: true },
    });

    // Record in audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE_PRODUCT",
        entity: "Product",
        entityId: product.id,
        details: JSON.stringify({ name: product.name, sku: product.sku, price: product.price }),
      },
    });

    return NextResponse.json(product);
  } catch (err: any) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
