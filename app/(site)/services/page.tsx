import type { Metadata } from "next";
import { SectionHeading } from "@/components/site/section-heading";
import { ServiceCard } from "@/components/site/service-card";
import { detailedServices } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services"
};

export default function ServicesPage() {
  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Services"
          title="Coverage for every ritual, frame, and heirloom."
          description="Choose the core coverage you need today. The system is structured so gallery delivery, proofing, and Drive-backed media workflows can grow later."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {detailedServices.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </div>
    </main>
  );
}
