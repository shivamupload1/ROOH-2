import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { HeroSection } from "@/components/site/hero-section";
import { PackageCard } from "@/components/site/package-card";
import { PortfolioGrid } from "@/components/site/portfolio-grid";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceCard } from "@/components/site/service-card";
import { packages, portfolioItems, services } from "@/lib/content";
import { getHomeHeroContent, getSiteBrand } from "@/lib/site-content";

export default async function HomePage() {
  const [siteBrand, hero] = await Promise.all([getSiteBrand(), getHomeHeroContent()]);

  return (
    <main>
      <HeroSection brand={siteBrand} hero={hero} />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="What we create"
            title="Wedding memories with emotion, scale, and detail."
            description="From quiet family rituals to grand royal entries, every service is shaped around the story of the couple and their people."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Portfolio"
            title="Stories across ceremonies, colors, and seasons."
            description="A visual preview of wedding, pre-wedding, haldi, mehendi, reception, and couple portrait work."
          />
          <PortfolioGrid items={portfolioItems.slice(0, 6)} compact />
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rust">Client gallery</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">
              Your wedding memories delivered privately through a secure gallery powered by Google Drive.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-ink/70">
              The private delivery portal supports event PINs, favorites, download control, and backend-tracked access.
            </p>
          </div>
          <div className="rounded-lg border border-marigold/30 bg-white p-6 shadow-soft">
            <div className="grid grid-cols-2 gap-3 text-sm text-ink/75">
              {["PIN access", "Album selection", "Download control", "Expiry dates"].map((item) => (
                <div key={item} className="rounded-md border border-rust/15 bg-ivory p-4 font-medium">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-16 text-ivory sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Packages"
            title="Simple starting points for different wedding scales."
            description="Each booking can be customized based on dates, team size, travel, albums, and film requirements."
            inverted
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {packages.map((item) => (
              <PackageCard key={item.name} {...item} dark />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1fr] lg:items-center">
          <div className="rounded-lg border border-marigold/30 bg-ivory p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rust">Kind words</p>
            <p className="mt-4 text-xl font-medium leading-8 text-ink">
              &ldquo;The photographs felt like our family story, not just event coverage. Every ritual, smile, and quiet moment
              was preserved beautifully.&rdquo;
            </p>
            <p className="mt-5 text-sm font-semibold text-ink/60">Rahul & Priya, Jaipur</p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rust">Bookings</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Planning a wedding in Jaipur or beyond?</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-ink/70">
              Tell us your date, city, ceremonies, and the kind of story you want to preserve. We will help shape a simple
              package around it.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ivory"
              >
                View Portfolio <ArrowRight size={18} />
              </Link>
              <Link
                href={siteBrand.whatsappHref}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-rust px-5 py-3 text-sm font-semibold text-rust"
              >
                Book on WhatsApp <MessageCircle size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
