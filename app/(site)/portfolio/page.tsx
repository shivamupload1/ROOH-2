import type { Metadata } from "next";
import { PortfolioGrid } from "@/components/site/portfolio-grid";
import { SectionHeading } from "@/components/site/section-heading";
import { portfolioItems } from "@/lib/content";

export const metadata: Metadata = {
  title: "Portfolio"
};

export default function PortfolioPage() {
  return (
    <main className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Portfolio"
          title="A curated preview of wedding stories."
          description="Filter by ceremony type and explore placeholder image cards designed for fast loading. Original files stay outside the public website."
        />
        <PortfolioGrid items={portfolioItems} />
      </div>
    </main>
  );
}
