import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PackageCard } from "@/components/site/package-card";
import { SectionHeading } from "@/components/site/section-heading";
import { packages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Packages"
};

export default function PackagesPage() {
  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Packages"
          title="Transparent starting packages for wedding stories."
          description="These are starting points. Final pricing depends on dates, travel, team size, deliverables, and album requirements."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {packages.map((item) => (
            <PackageCard key={item.name} {...item} />
          ))}
        </div>
        <div className="mt-10 rounded-lg border border-marigold/30 bg-white p-6">
          <h2 className="text-2xl font-semibold text-ink">Need a custom quote?</h2>
          <p className="mt-3 max-w-2xl text-ink/70">
            Share your event dates, venues, ceremonies, and preferred deliverables. We will shape a package around your
            celebration instead of forcing you into a fixed box.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-rust px-5 py-3 text-sm font-semibold text-white"
          >
            Send Inquiry <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </main>
  );
}
