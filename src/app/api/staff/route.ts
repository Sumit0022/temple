import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "TEMPLE_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const staff = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(staff);
  } catch (err: any) {
    console.error("Staff list error:", err);
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Super Admin can create staff accounts" }, { status: 403 });
    }

    const { name, email, password, role, phone } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Name, email, password, and role are required." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const newStaff = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
        phone: phone || null,
        isActive: true,
      },
      select: { id: true, name: true, email: true, role: true, phone: true, isActive: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE_STAFF_USER",
        entity: "User",
        entityId: newStaff.id,
        details: JSON.stringify({ email: newStaff.email, role: newStaff.role }),
      },
    });

    return NextResponse.json(newStaff);
  } catch (err: any) {
    console.error("Create staff error:", err);
    return NextResponse.json({ error: "Failed to create staff account" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, role, isActive } = await req.json();

    const updated = await prisma.user.update({
      where: { id },
      data: {
        role: role || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Update staff error:", err);
    return NextResponse.json({ error: "Failed to update staff" }, { status: 500 });
  }
}
