import Link from "next/link";
import { Images } from "lucide-react";

type GalleryAlbumCardProps = {
  name: string;
  href: string;
  mediaCount?: number;
};

export function GalleryAlbumCard({ name, href, mediaCount }: GalleryAlbumCardProps) {
  return (
    <Link href={href} className="block rounded-lg border border-marigold/30 bg-white p-5 transition hover:shadow-soft">
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-rust text-white">
        <Images size={20} />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-ink">{name}</h2>
      <p className="mt-2 text-sm text-ink/60">{mediaCount ?? 0} files</p>
    </Link>
  );
}
