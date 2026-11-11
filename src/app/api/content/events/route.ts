import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured");

    const where: any = { isPublished: true };
    if (featured === "true") where.isFeatured = true;

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json(events);
  } catch (err: any) {
    console.error("Events fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "events:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();
    const { title, titleHi, description, descriptionHi, bannerImage, startDate, endDate, location, isFeatured } = data;

    if (!title || !startDate || !endDate) {
      return NextResponse.json({ error: "Title, start date, and end date are required" }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + `-${Date.now().toString().slice(-4)}`;

    const event = await prisma.event.create({
      data: {
        title,
        titleHi: titleHi || title,
        slug,
        description: description || "",
        descriptionHi: descriptionHi || "",
        bannerImage: bannerImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: location || "Main Temple Sanctum",
        isFeatured: !!isFeatured,
        isPublished: true,
      },
    });

    return NextResponse.json(event);
  } catch (err: any) {
    console.error("Create event error:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
