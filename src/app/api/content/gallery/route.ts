import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where: any = { isPublished: true };
    if (category) where.category = category;

    const albums = await prisma.galleryAlbum.findMany({
      where,
      include: {
        mediaAssets: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(albums);
  } catch (err: any) {
    console.error("Gallery fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "gallery:write")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, titleHi, description, coverImage, category, mediaUrls } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Album title is required" }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + `-${Date.now().toString().slice(-4)}`;

    const album = await prisma.galleryAlbum.create({
      data: {
        title,
        titleHi: titleHi || title,
        slug,
        description: description || null,
        coverImage: coverImage || (mediaUrls && mediaUrls[0]) || null,
        category: category || "FESTIVAL",
        mediaAssets: {
          create: Array.isArray(mediaUrls)
            ? mediaUrls.map((url: string, idx: number) => ({
                url,
                title: `${title} - Photo ${idx + 1}`,
                mediaType: "IMAGE",
                sortOrder: idx + 1,
              }))
            : [],
        },
      },
      include: { mediaAssets: true },
    });

    return NextResponse.json(album);
  } catch (err: any) {
    console.error("Create album error:", err);
    return NextResponse.json({ error: "Failed to create album" }, { status: 500 });
  }
}
