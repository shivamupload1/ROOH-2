import type { Metadata } from "next";
import Image from "next/image";
import { SectionHeading } from "@/components/site/section-heading";
import { brand } from "@/lib/content";

export const metadata: Metadata = {
  title: "About"
};

export default function AboutPage() {
  return (
    <main className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
          <Image
            src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=1200&q=80"
            alt="Indian wedding couple portrait"
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <SectionHeading
            eyebrow="About"
            title="Stories made of rooh, rang, ritual, and memory."
            description=""
          />
          <div className="space-y-5 text-base leading-8 text-ink/75">
            <p>
              {brand.name} is a premium wedding photography studio based in {brand.city}. We photograph weddings as
              living family histories: the quiet glance before a ceremony, the color of a dupatta in afternoon light, the
              laughter in a crowded courtyard, and the emotion that arrives without announcement.
            </p>
            <p>
              Our style is cinematic and elegant, but never distant. We balance royal compositions with honest moments so
              your gallery feels both polished and personal. The work is designed for today&apos;s screens and tomorrow&apos;s
              albums.
            </p>
            <p>
              In the next phases, this website will grow into a simple client delivery portal with secure galleries,
              favorite selections, download control, and Google Drive-backed storage for each event.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
