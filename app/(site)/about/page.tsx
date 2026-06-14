import type { Metadata } from "next";
import Image from "next/image";
import { SectionHeading } from "@/components/site/section-heading";
import { getAboutContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About"
};

export default async function AboutPage() {
  const aboutContent = await getAboutContent();

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
            title={aboutContent.heading}
            description=""
          />
          <div className="space-y-5 text-base leading-8 text-ink/75">
            {aboutContent.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
