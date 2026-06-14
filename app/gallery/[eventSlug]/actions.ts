"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createGallerySession, getGallerySession, verifySecret } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { galleryPinSchema } from "@/lib/validators";

export async function verifyGalleryPinAction(eventSlug: string, formData: FormData) {
  const parsed = galleryPinSchema.parse(Object.fromEntries(formData));
  const event = await prisma.event.findUnique({ where: { id: parsed.eventId } });

  if (!event || event.slug !== eventSlug || !event.isPublished) {
    redirect(`/gallery/${eventSlug}?error=unavailable`);
  }

  const matches = await verifySecret(parsed.pin, event.pinHash);

  if (!matches) {
    redirect(`/gallery/${eventSlug}?error=pin`);
  }

  await createGallerySession(event.id);
  redirect(`/gallery/${eventSlug}`);
}

export async function toggleFavoriteAction(eventSlug: string, mediaFileId: string) {
  const event = await prisma.event.findUnique({ where: { slug: eventSlug }, select: { id: true } });

  if (!event) {
    redirect(`/gallery/${eventSlug}`);
  }

  const session = await getGallerySession(event.id);

  if (!session) {
    redirect(`/gallery/${eventSlug}`);
  }

  const existing = await prisma.favorite.findFirst({
    where: {
      eventId: event.id,
      mediaFileId,
      visitorId: session.visitorId
    },
    select: { id: true }
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({
      data: {
        eventId: event.id,
        mediaFileId,
        visitorId: session.visitorId
      }
    });
  }

  revalidatePath(`/gallery/${eventSlug}`);
}
