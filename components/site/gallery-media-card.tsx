import Image from "next/image";
import { Download, Heart, Play } from "lucide-react";

type GalleryMediaCardProps = {
  title: string;
  image: string;
  mediaType: "PHOTO" | "VIDEO";
  downloadAllowed?: boolean;
};

export function GalleryMediaCard({ title, image, mediaType, downloadAllowed }: GalleryMediaCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-marigold/25 bg-white">
      <div className="relative aspect-[4/3] bg-ink">
        <Image src={image} alt={title} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
        {mediaType === "VIDEO" ? (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-ink/70">
              <Play size={22} />
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <p className="truncate text-sm font-semibold text-ink">{title}</p>
        <div className="flex shrink-0 gap-2">
          <button type="button" className="flex h-9 w-9 items-center justify-center rounded-md border border-ink/10" title="Favorite">
            <Heart size={17} />
          </button>
          {downloadAllowed ? (
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-md border border-ink/10" title="Download">
              <Download size={17} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
