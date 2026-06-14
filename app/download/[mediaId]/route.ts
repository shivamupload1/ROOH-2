import { NextRequest, NextResponse } from "next/server";
import { getGallerySession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params;
  const media = await prisma.mediaFile.findUnique({
    where: { id: mediaId },
    include: { event: true }
  });

  if (!media || !media.event.isPublished || !media.event.downloadAllowed || !media.downloadAllowed) {
    return new NextResponse("Download not allowed", { status: 403 });
  }

  const session = await getGallerySession(media.eventId);

  if (!session) {
    return new NextResponse("Gallery PIN required", { status: 401 });
  }

  await prisma.download.create({
    data: {
      eventId: media.eventId,
      mediaFileId: media.id,
      visitorId: session.visitorId,
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] || null,
      userAgent: request.headers.get("user-agent")
    }
  });

  const target = media.previewUrl || media.thumbnailUrl;

  if (!target) {
    return new NextResponse("No downloadable file URL is stored yet.", { status: 404 });
  }

  return NextResponse.redirect(target);
}
