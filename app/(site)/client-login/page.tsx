import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole, MessageCircle } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { getSiteBrand } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Client Login"
};

export default async function ClientLoginPage() {
  const brand = await getSiteBrand();

  return (
    <main className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Client access"
          title="Open your private gallery link."
          description="Your studio will share a private event gallery link. Open it, enter the 4 digit PIN, then browse albums, save favorites, and download when allowed."
        />
        <div className="rounded-lg border border-marigold/30 bg-white p-6 shadow-soft">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-rust text-white">
            <LockKeyhole size={22} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-ink">Gallery access flow</h2>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-ink/70">
            <li>1. Open the private gallery link shared by the studio.</li>
            <li>2. Enter the 4 digit event PIN provided by the admin.</li>
            <li>3. Browse albums, favorite photos, and download files when allowed.</li>
          </ol>
          <Link
            href={brand.whatsappHref}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-ivory"
          >
            <MessageCircle size={18} />
            Ask for Gallery Link
          </Link>
        </div>
      </div>
    </main>
  );
}
