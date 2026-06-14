import type { ReactNode } from "react";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { getSiteBrand } from "@/lib/site-content";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const brand = await getSiteBrand();

  return (
    <>
      <Navbar brand={brand} />
      {children}
      <Footer brand={brand} />
      <WhatsAppButton brand={brand} />
    </>
  );
}
