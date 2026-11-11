import { NextResponse } from "next/server";
import { getCurrentUser, getCurrentDevotee } from "@/lib/auth";

export async function GET() {
  const [adminUser, devotee] = await Promise.all([
    getCurrentUser(),
    getCurrentDevotee(),
  ]);

  return NextResponse.json({
    user: adminUser,
    devotee: devotee,
  });
}
