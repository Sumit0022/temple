import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(announcements);
  } catch (err: any) {
    console.error("Announcements fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "events:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, titleHi, message, messageHi, type, isBanner, priority } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    const item = await prisma.announcement.create({
      data: {
        title,
        titleHi: titleHi || title,
        message,
        messageHi: messageHi || message,
        type: type || "INFO",
        isBanner: !!isBanner,
        priority: priority ? parseInt(priority) : 0,
        isActive: true,
      },
    });

    return NextResponse.json(item);
  } catch (err: any) {
    console.error("Create announcement error:", err);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
