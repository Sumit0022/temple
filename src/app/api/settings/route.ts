import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await prisma.templeSetting.findMany({
      orderBy: { group: "asc" },
    });

    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({ settings, settingsMap });
  } catch (err: any) {
    console.error("Settings fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Super Admin can update settings" }, { status: 403 });
    }

    const { settings } = await req.json(); // Record<string, string>

    for (const [key, value] of Object.entries(settings)) {
      await prisma.templeSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value), group: "GENERAL" },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE_SYSTEM_SETTINGS",
        entity: "TempleSetting",
        details: JSON.stringify({ keysUpdated: Object.keys(settings) }),
      },
    });

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (err: any) {
    console.error("Save settings error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
