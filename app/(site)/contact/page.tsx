import type { Metadata } from "next";
import Link from "next/link";
import { AtSign, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { FormField } from "@/components/admin/form-field";
import { SectionHeading } from "@/components/site/section-heading";
import { submitInquiryAction } from "@/app/(site)/contact/actions";
import { getSiteBrand } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Contact"
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const { sent } = await searchParams;
  const brand = await getSiteBrand();

  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Contact"
          title="Tell us about the celebration."
          description="Share the date, city, ceremonies, and the feeling you want your wedding story to carry."
        />

        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="rounded-lg bg-ink p-6 text-ivory">
            <h2 className="text-2xl font-semibold">Booking details</h2>
            <div className="mt-6 space-y-4 text-sm text-ivory/80">
              <Link href={brand.whatsappHref} className="flex items-center gap-3">
                <MessageCircle size={18} /> WhatsApp: {brand.whatsapp}
              </Link>
              <a href={`mailto:${brand.email}`} className="flex items-center gap-3">
                <Mail size={18} /> {brand.email}
              </a>
              <p className="flex items-center gap-3">
                <AtSign size={18} /> {brand.instagram}
              </p>
              <p className="flex items-center gap-3">
                <MapPin size={18} /> {brand.city}
              </p>
              <p className="flex items-center gap-3">
                <Phone size={18} /> Wedding and event inquiries
              </p>
            </div>
          </aside>

          <form action={submitInquiryAction} className="grid gap-4 rounded-lg border border-marigold/30 bg-white p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Name" name="name" required />
              <FormField label="Phone" name="phone" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Email" name="email" type="email" />
              <FormField label="Event type" name="eventType" placeholder="Wedding, pre-wedding..." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Event date" name="eventDate" type="date" />
              <FormField label="City" name="city" placeholder="Jaipur, Udaipur..." />
            </div>
            <label className="grid gap-2 text-sm font-medium text-ink">
              Message
              <textarea
                name="message"
                rows={5}
                className="rounded-md border border-ink/15 bg-ivory px-3 py-2 outline-none transition focus:border-rust"
                placeholder="Tell us about your ceremonies, venues, and deliverables."
              />
            </label>
            {sent === "1" ? (
              <p className="rounded-md bg-sage/10 px-3 py-2 text-sm font-semibold text-sage">
                Inquiry saved. The studio can see it in the admin panel.
              </p>
            ) : null}
            <button type="submit" className="inline-flex w-fit items-center gap-2 rounded-md bg-rust px-5 py-3 text-sm font-semibold text-white">
              <MessageCircle size={18} />
              Send Inquiry
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
