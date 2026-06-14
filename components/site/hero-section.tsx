import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import type { HomeHeroContent, SiteBrand } from "@/lib/site-content";

export function HeroSection({ brand, hero }: { brand: SiteBrand; hero: HomeHeroContent }) {
  return (
    <section className="relative min-h-[78vh] overflow-hidden bg-ink text-ivory">
      <Image
        src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=1800&q=80"
        alt="Premium Indian wedding photography"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/65 to-ink/10" />
      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-marigold">{hero.eyebrow}</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight text-balance sm:text-6xl lg:text-7xl">
            {hero.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ivory/82 sm:text-lg">
            {hero.subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-marigold px-5 py-3 text-sm font-bold text-ink"
            >
              View Portfolio <ArrowRight size={18} />
            </Link>
            <Link
              href={brand.whatsappHref}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-ivory/40 px-5 py-3 text-sm font-bold text-ivory"
            >
              Book on WhatsApp <MessageCircle size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
