import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const where: any = { isActive: true };
    if (categoryId) where.categoryId = categoryId;

    const [sevas, categories] = await Promise.all([
      prisma.seva.findMany({
        where,
        include: { category: true },
        orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
      }),
      prisma.sevaCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    return NextResponse.json({ sevas, categories });
  } catch (err: any) {
    console.error("Sevas fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch sevas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "sevas:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();
    const {
      name,
      nameHi,
      categoryId,
      code,
      description,
      descriptionHi,
      deityName,
      price,
      durationMinutes,
      maxBookingsPerDay,
      timings,
      includesPrasad,
      isSpecialDarshan,
      isFeatured,
    } = data;

    if (!name || !categoryId || !price || !code) {
      return NextResponse.json({ error: "Name, category, code, and price are required." }, { status: 400 });
    }

    const seva = await prisma.seva.create({
      data: {
        name,
        nameHi: nameHi || name,
        code: code.toUpperCase().trim(),
        categoryId,
        description: description || "",
        descriptionHi: descriptionHi || "",
        deityName: deityName || "Main Sanctum Deities",
        price: parseFloat(price),
        durationMinutes: parseInt(durationMinutes || 30),
        maxBookingsPerDay: parseInt(maxBookingsPerDay || 10),
        timings: timings || "07:00 AM, 09:30 AM",
        includesPrasad: !!includesPrasad,
        isSpecialDarshan: !!isSpecialDarshan,
        isFeatured: !!isFeatured,
      },
      include: { category: true },
    });

    return NextResponse.json(seva);
  } catch (err: any) {
    console.error("Create seva error:", err);
    return NextResponse.json({ error: "Failed to create seva" }, { status: 500 });
  }
}
