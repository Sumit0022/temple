import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  response.cookies.delete("tms_admin_token");
  response.cookies.delete("tms_devotee_token");
  return response;
}
