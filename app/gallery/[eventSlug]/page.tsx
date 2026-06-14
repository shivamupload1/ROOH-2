import Link from "next/link";
import { Download, Heart, LockKeyhole, Play, Send } from "lucide-react";
import { verifyGalleryPinAction, toggleFavoriteAction } from "@/app/gallery/[eventSlug]/actions";
import { FormField } from "@/components/admin/form-field";
import { getGallerySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSiteBrand } from "@/lib/site-content";

export const dynamic = "force-dynamic";

function isExpired(expiryDate?: Date | null) {
  return Boolean(expiryDate && expiryDate.getTime() < Date.now());
}

export default async function GalleryPage({
  params,
  searchParams
}: {
  params: Promise<{ eventSlug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { eventSlug } = await params;
  const { error } = await searchParams;
  const brand = await getSiteBrand();
  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: {
      client: true,
      albums: {
        include: {
          mediaFiles: {
            orderBy: { createdAt: "asc" }
          }
        },
        orderBy: { sortOrder: "asc" }
      }
    }
  });

  if (!event || !event.isPublished) {
    return (
      <main className="min-h-screen bg-ivory px-4 py-16 text-ink">
        <div className="mx-auto max-w-xl rounded-lg bg-white p-8 text-center shadow-soft">
          <LockKeyhole className="mx-auto text-rust" />
          <h1 className="mt-4 text-3xl font-semibold">Gallery unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-ink/65">This gallery is not published yet. Please contact the studio.</p>
        </div>
      </main>
    );
  }

  if (isExpired(event.expiryDate)) {
    return (
      <main className="min-h-screen bg-ivory px-4 py-16 text-ink">
        <div className="mx-auto max-w-xl rounded-lg bg-white p-8 text-center shadow-soft">
          <LockKeyhole className="mx-auto text-rust" />
          <h1 className="mt-4 text-3xl font-semibold">Gallery expired</h1>
          <p className="mt-3 text-sm leading-6 text-ink/65">This private gallery has passed its expiry date. Ask the studio to reopen it.</p>
        </div>
      </main>
    );
  }

  const session = await getGallerySession(event.id);

  if (!session) {
    return (
      <main className="min-h-screen bg-ivory px-4 py-16 text-ink">
        <div className="mx-auto max-w-md rounded-lg border border-marigold/30 bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rust">{brand.name}</p>
          <h1 className="mt-3 text-3xl font-semibold">{event.name}</h1>
          <p className="mt-2 text-sm text-ink/60">{event.client.name} private gallery</p>
          <form action={verifyGalleryPinAction.bind(null, event.slug)} className="mt-7 grid gap-4">
            <input type="hidden" name="eventId" value={event.id} />
            <FormField label="4 digit gallery PIN" name="pin" type="password" inputMode="numeric" minLength={4} maxLength={4} required />
            {error === "pin" ? <p className="rounded-md bg-rust/10 px-3 py-2 text-sm font-semibold text-rust">Wrong PIN. Please try again.</p> : null}
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ivory transition hover:bg-rust">
              <LockKeyhole size={17} />
              Open Gallery
            </button>
          </form>
        </div>
      </main>
    );
  }

  const favorites = await prisma.favorite.findMany({
    where: { eventId: event.id, visitorId: session.visitorId },
    select: { mediaFileId: true }
  });
  const favoriteIds = new Set(favorites.map((favorite) => favorite.mediaFileId));

  return (
    <main className="min-h-screen bg-ivory text-ink">
      <section className="border-b border-ink/10 bg-ink px-4 py-8 text-ivory sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-marigold">{brand.name}</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold">{event.name}</h1>
              <p className="mt-2 text-sm text-ivory/65">
                {event.client.name} / {event.city || brand.city} / {event.eventType || "Private gallery"}
              </p>
            </div>
            <div className="rounded-md border border-white/15 px-4 py-3 text-sm text-ivory/75">
              {favorites.length} favorites saved
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        {event.albums.map((album) => (
          <div key={album.id}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{album.name}</h2>
                <p className="text-sm text-ink/55">{album.mediaFiles.length} files</p>
              </div>
            </div>

            {album.mediaFiles.length === 0 ? (
              <div className="rounded-lg border border-ink/10 bg-white px-4 py-8 text-center text-sm text-ink/55">
                No media in this album yet.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {album.mediaFiles.map((media) => {
                  const isFavorite = favoriteIds.has(media.id);
                  const canDownload = event.downloadAllowed && media.downloadAllowed;
                  const image = media.thumbnailUrl || media.previewUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80";

                  return (
                    <article key={media.id} className="overflow-hidden rounded-lg border border-marigold/25 bg-white">
                      <div className="relative aspect-[4/3] bg-ink">
                        <div
                          role="img"
                          aria-label={media.fileName}
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url("${image}")` }}
                        />
                        {media.mediaType === "VIDEO" ? (
                          <div className="absolute inset-0 flex items-center justify-center text-white">
                            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-ink/70">
                              <Play size={22} />
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between gap-3 p-4">
                        <p className="min-w-0 truncate text-sm font-semibold text-ink">{media.fileName}</p>
                        <div className="flex shrink-0 gap-2">
                          <form action={toggleFavoriteAction.bind(null, event.slug, media.id)}>
                            <button
                              type="submit"
                              className={`flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 ${isFavorite ? "bg-rust text-white" : "text-ink"}`}
                              title={isFavorite ? "Remove favorite" : "Favorite"}
                            >
                              <Heart size={17} />
                            </button>
                          </form>
                          {canDownload ? (
                            <Link
                              href={`/download/${media.id}`}
                              className="flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 text-ink"
                              title="Download"
                            >
                              <Download size={17} />
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <div className="rounded-lg border border-marigold/30 bg-white p-6">
          <h2 className="text-xl font-semibold">Album selection</h2>
          <p className="mt-2 text-sm text-ink/60">Favorites are saved automatically for this visitor session.</p>
          <button type="button" className="mt-4 inline-flex items-center gap-2 rounded-md bg-rust px-5 py-3 text-sm font-semibold text-white">
            <Send size={17} />
            Submit Selection
          </button>
        </div>
      </section>
    </main>
  );
}
