import Image from "next/image";
import Link from "next/link";
import { Download, Heart, LockKeyhole, Play, Send } from "lucide-react";
import { submitSelectionAction, toggleFavoriteAction, verifyGalleryPinAction } from "@/app/gallery/[eventSlug]/actions";
import { FormField } from "@/components/admin/form-field";
import { getGallerySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseSelectionSubmission, selectionSubmissionKey } from "@/lib/selection-submissions";
import { getSiteBrand } from "@/lib/site-content";

export const dynamic = "force-dynamic";

function isExpired(expiryDate?: Date | null) {
  return Boolean(expiryDate && expiryDate.getTime() < Date.now());
}

function formatEventDate(value?: Date | null) {
  if (!value) {
    return "Private gallery";
  }

  return value.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function compareMediaByFileName(a: { fileName: string }, b: { fileName: string }) {
  return a.fileName.localeCompare(b.fileName, "en", { numeric: true, sensitivity: "base" });
}

function viewHref(eventSlug: string, view: string) {
  if (view === "all") {
    return `/gallery/${eventSlug}`;
  }

  return `/gallery/${eventSlug}?view=${encodeURIComponent(view)}`;
}

export default async function GalleryPage({
  params,
  searchParams
}: {
  params: Promise<{ eventSlug: string }>;
  searchParams: Promise<{ error?: string; selection?: string; view?: string }>;
}) {
  const { eventSlug } = await params;
  const { error, selection, view } = await searchParams;
  const brand = await getSiteBrand();
  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: {
      client: true,
      mediaFiles: {
        where: { albumId: null },
        orderBy: { createdAt: "asc" }
      },
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
  const savedSelection = parseSelectionSubmission(
    (
      await prisma.settings.findUnique({
        where: { key: selectionSubmissionKey(event.id, session.visitorId) },
        select: { value: true }
      })
    )?.value
  );

  const rootMedia = [...event.mediaFiles].sort(compareMediaByFileName);
  const visibleAlbums = event.albums
    .map((album) => ({
      ...album,
      mediaFiles: [...album.mediaFiles].sort(compareMediaByFileName)
    }))
    .filter((album) => album.mediaFiles.length > 0);
  const albumNameById = new Map(visibleAlbums.map((album) => [album.id, album.name]));
  const allMedia = [...rootMedia, ...visibleAlbums.flatMap((album) => album.mediaFiles)].sort(compareMediaByFileName);
  const highlightMedia = allMedia.filter((media) => media.isFeatured);
  const favoriteMedia = allMedia.filter((media) => favoriteIds.has(media.id));
  const tabs = [
    { key: "all", label: "All Photos", count: allMedia.length },
    { key: "favorites", label: "Favorites", count: favoriteMedia.length },
    ...(highlightMedia.length > 0 ? [{ key: "highlights", label: "Highlights", count: highlightMedia.length }] : []),
    ...visibleAlbums.map((album) => ({
      key: album.slug,
      label: album.name,
      count: album.mediaFiles.length
    }))
  ];
  const selectedView = tabs.some((tab) => tab.key === view) ? (view as string) : "all";
  const activeTab = tabs.find((tab) => tab.key === selectedView) || tabs[0];
  const activeMedia =
    selectedView === "favorites"
      ? favoriteMedia
      : selectedView === "highlights"
        ? highlightMedia
        : selectedView === "all"
          ? allMedia
          : visibleAlbums.find((album) => album.slug === selectedView)?.mediaFiles || [];
  const heroMedia = highlightMedia.find((media) => media.mediaType === "PHOTO") || allMedia.find((media) => media.mediaType === "PHOTO") || allMedia[0];
  const heroImageSrc = heroMedia ? `/api/media/${heroMedia.id}` : null;

  return (
    <main className="min-h-screen bg-white text-ink">
      <section className="relative min-h-[320px] bg-ink md:min-h-[420px]">
        {heroImageSrc ? (
          <Image src={heroImageSrc} alt={event.name} fill priority unoptimized sizes="100vw" className="absolute inset-0 object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-ink via-rust/70 to-marigold/50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/50" />
      </section>

      <section className="border-b border-ink/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:items-end lg:px-8">
          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rust">{brand.name}</p>
            <p className="mt-2 text-sm text-ink/55">{event.client.name}</p>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">{event.name}</h1>
            <p className="mt-3 text-sm text-ink/55">{formatEventDate(event.eventDate)}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
            <div className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/75">{favorites.length} favorites</div>
            <div className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink/75">
              {event.downloadAllowed ? "Downloads enabled" : "Downloads off"}
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-10 border-b border-ink/10 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex min-w-max items-center gap-2 py-3">
            {tabs.map((tab) => {
              const isActive = tab.key === selectedView;

              return (
                <Link
                  key={tab.key}
                  href={viewHref(event.slug, tab.key)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-ink bg-ink text-white"
                      : "border-ink/10 bg-white text-ink/70 hover:border-rust hover:text-rust"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-xs ${isActive ? "text-white/80" : "text-ink/45"}`}>{tab.count}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-ink">{activeTab?.label || "Gallery"}</h2>
            <p className="mt-2 text-sm text-ink/55">{activeMedia.length} photos ready in this view.</p>
          </div>
          {selectedView === "favorites" ? (
            <p className="text-sm text-ink/60">Save favorites as you browse, then submit once your shortlist is done.</p>
          ) : null}
        </div>

        {activeMedia.length === 0 ? (
          <div className="rounded-lg border border-ink/10 bg-ivory px-5 py-10 text-center text-sm text-ink/60">
            {selectedView === "favorites"
              ? "No favorites saved yet. Tap the heart on any photo to keep it here."
              : "No photos are available in this section yet. Sync the Drive folder from the admin panel after adding subfolders and images."}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 [column-gap:1rem]">
            {activeMedia.map((media) => {
              const isFavorite = favoriteIds.has(media.id);
              const canDownload = event.downloadAllowed && media.downloadAllowed;
              const imageSrc = media.mediaType === "PHOTO" || media.thumbnailUrl ? `/api/media/${media.id}` : null;
              const albumLabel = media.albumId ? albumNameById.get(media.albumId) : "Root folder";

              return (
                <article key={media.id} className="group mb-4 break-inside-avoid overflow-hidden rounded-md bg-white shadow-[0_10px_30px_rgba(36,31,31,0.08)]">
                  <div className="relative overflow-hidden bg-ink/10">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={media.fileName}
                        width={media.width || 1600}
                        height={media.height || 1200}
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        unoptimized
                        className="block h-auto w-full object-cover transition duration-300 group-hover:scale-[1.01]"
                      />
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center bg-ink text-white">
                        <Play size={28} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
                      {albumLabel ? (
                        <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
                          {albumLabel}
                        </span>
                      ) : (
                        <span />
                      )}
                      {media.mediaType === "VIDEO" ? (
                        <span className="rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">Video</span>
                      ) : null}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 text-white">
                      <p className="min-w-0 truncate text-sm font-semibold">{media.fileName}</p>
                      <div className="flex shrink-0 gap-2">
                        <form action={toggleFavoriteAction.bind(null, event.slug, media.id)}>
                          <button
                            type="submit"
                            className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                              isFavorite
                                ? "border-rust bg-rust text-white"
                                : "border-white/35 bg-black/35 text-white hover:border-white hover:bg-black/50"
                            }`}
                            title={isFavorite ? "Remove favorite" : "Save favorite"}
                          >
                            <Heart size={16} />
                          </button>
                        </form>
                        {canDownload ? (
                          <Link
                            href={`/download/${media.id}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-black/35 text-white transition hover:border-white hover:bg-black/50"
                            title="Download"
                          >
                            <Download size={16} />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-t border-ink/10 bg-ivory/50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-marigold/25 bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-2xl">
                <h2 className="text-xl font-semibold text-ink">Submit your shortlist</h2>
                <p className="mt-2 text-sm leading-6 text-ink/60">
                  Favorites are saved automatically for this visitor session. Submit once when your shortlist is final so the studio can review it.
                </p>
                {selection === "submitted" ? (
                  <p className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    Selection submitted successfully. The studio can now review your favorites.
                  </p>
                ) : null}
                {selection === "empty" ? (
                  <p className="mt-4 rounded-md bg-rust/10 px-4 py-3 text-sm font-medium text-rust">
                    Please save at least one favorite before submitting your selection.
                  </p>
                ) : null}
                {savedSelection ? (
                  <p className="mt-4 text-sm text-ink/60">
                    Last submitted: {new Date(savedSelection.submittedAt).toLocaleString("en-IN")} with {savedSelection.favoriteCount} favorites.
                  </p>
                ) : null}
              </div>

              <form action={submitSelectionAction.bind(null, event.slug)}>
                <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-rust px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink">
                  <Send size={17} />
                  {savedSelection ? "Resubmit Selection" : "Submit Selection"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
