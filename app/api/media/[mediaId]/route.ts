import { NextRequest, NextResponse } from "next/server";
import { getGallerySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchDriveFileAsset } from "@/lib/google-drive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params;
  const media = await prisma.mediaFile.findUnique({
    where: { id: mediaId },
    include: { event: true }
  });

  if (!media || !media.event.isPublished) {
    return new NextResponse("Media not found", { status: 404 });
  }

  const session = await getGallerySession(media.eventId);

  if (!session) {
    return new NextResponse("Gallery PIN required", { status: 401 });
  }

  try {
    const wantsOriginal = request.nextUrl.searchParams.get("download") === "1";
    const prefersThumbnail = !wantsOriginal && Boolean(media.thumbnailUrl);
    const assetResponse = await fetchDriveFileAsset({
      driveAccountId: media.driveAccountId,
      fileId: media.driveFileId,
      thumbnailUrl: media.thumbnailUrl,
      preferThumbnail: prefersThumbnail,
      fallbackToMedia: media.mimeType.startsWith("image/")
    });
    const assetBody = await assetResponse.arrayBuffer();

    return new NextResponse(assetBody, {
      headers: {
        "content-type": assetResponse.headers.get("content-type") || media.mimeType || "application/octet-stream",
        "cache-control": "private, no-store, max-age=0"
      }
    });
  } catch {
    return new NextResponse("Could not load this Google Drive file right now.", { status: 502 });
  }
}
