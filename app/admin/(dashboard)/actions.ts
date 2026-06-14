"use server";

import { InquiryStatus, MediaType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, hashSecret, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug";
import {
  albumSchema,
  clientSchema,
  driveAccountSchema,
  eventSchema,
  importDriveFolderSchema,
  mediaFileSchema,
  studioSettingsSchema,
  websiteContentSchema
} from "@/lib/validators";
import { createFolder, importFilesFromFolder } from "@/lib/google-drive";

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

function textOrNull(value?: string | null) {
  return value && value.length > 0 ? value : null;
}

function dateOrNull(value?: string | null) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function expiryFromOption(option: "30" | "90" | "none") {
  if (option === "none") {
    return null;
  }

  const date = new Date();
  date.setDate(date.getDate() + Number(option));
  return date;
}

async function eventSlug(input: { name: string; slug?: string | null; currentEventId?: string }) {
  const baseSlug = generateSlug(input.slug || input.name) || generateSlug(input.name);

  return ensureUniqueSlug(baseSlug, async (slug) => {
    const existing = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
    return Boolean(existing && existing.id !== input.currentEventId);
  });
}

async function albumSlug(input: { eventId: string; name: string; slug?: string | null; currentAlbumId?: string }) {
  const baseSlug = generateSlug(input.slug || input.name) || generateSlug(input.name);

  return ensureUniqueSlug(baseSlug, async (slug) => {
    const existing = await prisma.album.findUnique({
      where: { eventId_slug: { eventId: input.eventId, slug } },
      select: { id: true }
    });
    return Boolean(existing && existing.id !== input.currentAlbumId);
  });
}

export async function createClientAction(formData: FormData) {
  await requireAdminSession();
  const parsed = clientSchema.parse(Object.fromEntries(formData));

  await prisma.client.create({
    data: {
      name: parsed.name,
      email: textOrNull(parsed.email),
      phone: textOrNull(parsed.phone),
      city: textOrNull(parsed.city),
      notes: textOrNull(parsed.notes)
    }
  });

  revalidatePath("/admin/clients");
  redirect("/admin/clients");
}

export async function updateClientAction(id: string, formData: FormData) {
  await requireAdminSession();
  const parsed = clientSchema.parse(Object.fromEntries(formData));

  await prisma.client.update({
    where: { id },
    data: {
      name: parsed.name,
      email: textOrNull(parsed.email),
      phone: textOrNull(parsed.phone),
      city: textOrNull(parsed.city),
      notes: textOrNull(parsed.notes)
    }
  });

  revalidatePath("/admin/clients");
  redirect("/admin/clients");
}

export async function deleteClientAction(id: string) {
  await requireAdminSession();
  await prisma.client.delete({ where: { id } });
  revalidatePath("/admin/clients");
  redirect("/admin/clients");
}

export async function createDriveAccountAction(formData: FormData) {
  await requireAdminSession();
  const parsed = driveAccountSchema.parse(Object.fromEntries(formData));

  await prisma.driveAccount.create({
    data: {
      clientId: textOrNull(parsed.clientId),
      label: parsed.label,
      googleEmail: textOrNull(parsed.googleEmail),
      accountType: parsed.accountType
    }
  });

  revalidatePath("/admin/drive-accounts");
  redirect("/admin/drive-accounts");
}

export async function deleteDriveAccountAction(id: string) {
  await requireAdminSession();
  await prisma.driveAccount.delete({ where: { id } });
  revalidatePath("/admin/drive-accounts");
  redirect("/admin/drive-accounts");
}

export async function createEventAction(formData: FormData) {
  await requireAdminSession();
  const parsed = eventSchema.parse(Object.fromEntries(formData));
  const slug = await eventSlug({ name: parsed.name, slug: parsed.slug });
  const pinHash = await hashSecret(parsed.pin);

  const event = await prisma.event.create({
    data: {
      clientId: parsed.clientId,
      driveAccountId: parsed.driveAccountId,
      name: parsed.name,
      slug,
      eventType: textOrNull(parsed.eventType),
      eventDate: dateOrNull(parsed.eventDate),
      city: textOrNull(parsed.city),
      pinHash,
      expiryDate: expiryFromOption(parsed.expiryOption),
      downloadAllowed: parsed.downloadAllowed === "on",
      isPublished: parsed.isPublished === "on",
      albums: {
        create: [
          { name: "Haldi", slug: "haldi", sortOrder: 1 },
          { name: "Mehendi", slug: "mehendi", sortOrder: 2 },
          { name: "Wedding", slug: "wedding", sortOrder: 3 },
          { name: "Reception", slug: "reception", sortOrder: 4 },
          { name: "Videos", slug: "videos", sortOrder: 5 }
        ]
      }
    }
  });

  revalidatePath("/admin/events");
  redirect(`/admin/events/${event.id}`);
}

export async function updateEventAction(id: string, formData: FormData) {
  await requireAdminSession();
  const parsed = eventSchema.parse(Object.fromEntries(formData));
  const slug = await eventSlug({ name: parsed.name, slug: parsed.slug, currentEventId: id });
  const pinHash = await hashSecret(parsed.pin);

  await prisma.event.update({
    where: { id },
    data: {
      clientId: parsed.clientId,
      driveAccountId: parsed.driveAccountId,
      name: parsed.name,
      slug,
      eventType: textOrNull(parsed.eventType),
      eventDate: dateOrNull(parsed.eventDate),
      city: textOrNull(parsed.city),
      pinHash,
      expiryDate: expiryFromOption(parsed.expiryOption),
      downloadAllowed: parsed.downloadAllowed === "on",
      isPublished: parsed.isPublished === "on"
    }
  });

  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function deleteEventAction(id: string) {
  await requireAdminSession();
  await prisma.event.delete({ where: { id } });
  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function createEventDriveFoldersAction(id: string) {
  await requireAdminSession();
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      driveAccount: true,
      albums: { orderBy: { sortOrder: "asc" } }
    }
  });

  if (!event) {
    redirect("/admin/events");
  }

  const eventFolder = event.driveFolderId
    ? { id: event.driveFolderId }
    : await createFolder(event.driveAccountId, event.name, event.driveAccount.rootFolderId);

  if (eventFolder.id && !event.driveFolderId) {
    await prisma.event.update({
      where: { id },
      data: { driveFolderId: eventFolder.id }
    });
  }

  for (const album of event.albums) {
    if (!album.driveFolderId && eventFolder.id) {
      const folder = await createFolder(event.driveAccountId, album.name, eventFolder.id);

      if (folder.id) {
        await prisma.album.update({
          where: { id: album.id },
          data: { driveFolderId: folder.id }
        });
      }
    }
  }

  revalidatePath(`/admin/events/${id}`);
  redirect(`/admin/events/${id}`);
}

export async function createAlbumAction(formData: FormData) {
  await requireAdminSession();
  const parsed = albumSchema.parse(Object.fromEntries(formData));
  const slug = await albumSlug({ eventId: parsed.eventId, name: parsed.name, slug: parsed.slug });

  await prisma.album.create({
    data: {
      eventId: parsed.eventId,
      name: parsed.name,
      slug,
      sortOrder: parsed.sortOrder,
      driveFolderId: textOrNull(parsed.driveFolderId)
    }
  });

  revalidatePath("/admin/albums");
  redirect("/admin/albums");
}

export async function updateAlbumAction(id: string, formData: FormData) {
  await requireAdminSession();
  const parsed = albumSchema.parse(Object.fromEntries(formData));
  const slug = await albumSlug({ eventId: parsed.eventId, name: parsed.name, slug: parsed.slug, currentAlbumId: id });

  await prisma.album.update({
    where: { id },
    data: {
      eventId: parsed.eventId,
      name: parsed.name,
      slug,
      sortOrder: parsed.sortOrder,
      driveFolderId: textOrNull(parsed.driveFolderId)
    }
  });

  revalidatePath("/admin/albums");
  redirect("/admin/albums");
}

export async function deleteAlbumAction(id: string) {
  await requireAdminSession();
  await prisma.album.delete({ where: { id } });
  revalidatePath("/admin/albums");
  redirect("/admin/albums");
}

export async function createMediaFileAction(formData: FormData) {
  await requireAdminSession();
  const parsed = mediaFileSchema.parse(Object.fromEntries(formData));

  await prisma.mediaFile.create({
    data: {
      eventId: parsed.eventId,
      albumId: textOrNull(parsed.albumId),
      driveAccountId: parsed.driveAccountId,
      driveFileId: parsed.driveFileId,
      fileName: parsed.fileName,
      mimeType: parsed.mimeType,
      mediaType: parsed.mediaType as MediaType,
      thumbnailUrl: textOrNull(parsed.thumbnailUrl),
      previewUrl: textOrNull(parsed.previewUrl),
      downloadAllowed: parsed.downloadAllowed === "on",
      isFeatured: parsed.isFeatured === "on"
    }
  });

  revalidatePath("/admin/media");
  redirect("/admin/media");
}

export async function deleteMediaFileAction(id: string) {
  await requireAdminSession();
  await prisma.mediaFile.delete({ where: { id } });
  revalidatePath("/admin/media");
  redirect("/admin/media");
}

export async function importDriveFolderAction(formData: FormData) {
  await requireAdminSession();
  const parsed = importDriveFolderSchema.parse(Object.fromEntries(formData));
  await importFilesFromFolder(parsed.driveAccountId, parsed.eventId, textOrNull(parsed.albumId), parsed.folderId);
  revalidatePath("/admin/media");
  redirect("/admin/media");
}

export async function updateInquiryStatusAction(id: string, formData: FormData) {
  await requireAdminSession();
  const status = formData.get("status");

  if (!status || !["NEW", "CONTACTED", "BOOKED", "ARCHIVED"].includes(String(status))) {
    return;
  }

  await prisma.inquiry.update({
    where: { id },
    data: { status: status as InquiryStatus }
  });

  revalidatePath("/admin/inquiries");
}

export async function updateWebsiteContentAction(formData: FormData) {
  await requireAdminSession();
  const parsed = websiteContentSchema.parse(Object.fromEntries(formData));

  await Promise.all([
    prisma.websiteContent.upsert({
      where: { key: "homeHero" },
      update: {
        value: {
          eyebrow: parsed.heroEyebrow,
          title: parsed.heroTitle,
          subtitle: parsed.heroSubtitle
        }
      },
      create: {
        key: "homeHero",
        value: {
          eyebrow: parsed.heroEyebrow,
          title: parsed.heroTitle,
          subtitle: parsed.heroSubtitle
        }
      }
    }),
    prisma.websiteContent.upsert({
      where: { key: "about" },
      update: {
        value: {
          heading: parsed.aboutHeading,
          paragraph1: parsed.aboutParagraph1,
          paragraph2: parsed.aboutParagraph2,
          paragraph3: parsed.aboutParagraph3
        }
      },
      create: {
        key: "about",
        value: {
          heading: parsed.aboutHeading,
          paragraph1: parsed.aboutParagraph1,
          paragraph2: parsed.aboutParagraph2,
          paragraph3: parsed.aboutParagraph3
        }
      }
    })
  ]);

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/client-login");
  revalidatePath("/admin/content");
  redirect("/admin/content");
}

export async function updateStudioSettingsAction(formData: FormData) {
  await requireAdminSession();
  const parsed = studioSettingsSchema.parse(Object.fromEntries(formData));

  await Promise.all([
    prisma.websiteContent.upsert({
      where: { key: "brand" },
      update: {
        value: {
          name: parsed.brandName,
          tagline: parsed.tagline,
          city: parsed.city
        }
      },
      create: {
        key: "brand",
        value: {
          name: parsed.brandName,
          tagline: parsed.tagline,
          city: parsed.city
        }
      }
    }),
    prisma.settings.upsert({
      where: { key: "contact" },
      update: {
        value: {
          whatsapp: parsed.whatsapp,
          email: parsed.email,
          instagram: parsed.instagram
        }
      },
      create: {
        key: "contact",
        value: {
          whatsapp: parsed.whatsapp,
          email: parsed.email,
          instagram: parsed.instagram
        }
      }
    }),
    prisma.settings.upsert({
      where: { key: "galleryDefaults" },
      update: {
        value: {
          defaultExpiryDays: Number(parsed.defaultExpiryDays),
          allowDownloadsByDefault: parsed.allowDownloadsByDefault === "on",
          pinLength: 4,
          publicDomain: parsed.publicDomain
        }
      },
      create: {
        key: "galleryDefaults",
        value: {
          defaultExpiryDays: Number(parsed.defaultExpiryDays),
          allowDownloadsByDefault: parsed.allowDownloadsByDefault === "on",
          pinLength: 4,
          publicDomain: parsed.publicDomain
        }
      }
    })
  ]);

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/client-login");
  revalidatePath("/admin/settings");
  redirect("/admin/settings");
}
