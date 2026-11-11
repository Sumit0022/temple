import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "mandir_secret_key_tms_2026_divine";

export type UserRole =
  | "SUPER_ADMIN"
  | "TEMPLE_ADMIN"
  | "ACCOUNTANT"
  | "DONATION_MANAGER"
  | "STORE_MANAGER"
  | "INVENTORY_MANAGER"
  | "EVENT_MANAGER"
  | "SEVA_MANAGER"
  | "GENERAL_STAFF";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
}

export interface SessionDevotee {
  id: string;
  email?: string | null;
  name: string;
  phone: string;
  gotra?: string | null;
}

// -------------------------------------------------------------
// PASSWORD HELPERS
// -------------------------------------------------------------
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// -------------------------------------------------------------
// JWT TOKEN GENERATION & VERIFICATION
// -------------------------------------------------------------
export function signUserToken(user: SessionUser): string {
  return jwt.sign(
    {
      type: "STAFF",
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function signDevoteeToken(devotee: SessionDevotee): string {
  return jwt.sign(
    {
      type: "DEVOTEE",
      id: devotee.id,
      email: devotee.email,
      name: devotee.name,
      phone: devotee.phone,
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// -------------------------------------------------------------
// SERVER-SIDE SESSION RETRIEVAL
// -------------------------------------------------------------
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("tms_admin_token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== "STAFF") return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, phone: true, isActive: true },
    });

    if (!user || !user.isActive) return null;
    return user as SessionUser;
  } catch (error) {
    return null;
  }
}

export async function getCurrentDevotee(): Promise<SessionDevotee | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("tms_devotee_token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== "DEVOTEE") return null;

    const devotee = await prisma.devotee.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, phone: true, gotra: true },
    });

    return devotee as SessionDevotee | null;
  } catch (error) {
    return null;
  }
}

// -------------------------------------------------------------
// RBAC PERMISSION MATRIX
// -------------------------------------------------------------
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: ["*"],
  TEMPLE_ADMIN: [
    "donations:read",
    "donations:write",
    "store:read",
    "store:write",
    "inventory:read",
    "inventory:write",
    "sevas:read",
    "sevas:write",
    "events:read",
    "events:write",
    "gallery:read",
    "gallery:write",
    "finance:read",
    "finance:write",
    "reports:read",
    "settings:read",
  ],
  ACCOUNTANT: [
    "donations:read",
    "store:read",
    "inventory:read",
    "finance:read",
    "finance:write",
    "reports:read",
  ],
  DONATION_MANAGER: [
    "donations:read",
    "donations:write",
    "reports:read",
  ],
  STORE_MANAGER: [
    "store:read",
    "store:write",
    "inventory:read",
    "inventory:write",
    "reports:read",
  ],
  INVENTORY_MANAGER: [
    "inventory:read",
    "inventory:write",
    "store:read",
  ],
  SEVA_MANAGER: [
    "sevas:read",
    "sevas:write",
    "reports:read",
  ],
  EVENT_MANAGER: [
    "events:read",
    "events:write",
    "gallery:read",
    "gallery:write",
  ],
  GENERAL_STAFF: [
    "donations:read",
    "store:read",
    "sevas:read",
    "events:read",
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  if (role === "SUPER_ADMIN") return true;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes("*") || permissions.includes(permission);
}
