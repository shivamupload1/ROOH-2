import Link from "next/link";
import { AtSign, Mail, MapPin, MessageCircle } from "lucide-react";
import { navItems } from "@/lib/content";
import type { SiteBrand } from "@/lib/site-content";

export function Footer({ brand }: { brand: SiteBrand }) {
  return (
    <footer className="border-t border-ink/10 bg-ink px-4 py-10 text-ivory sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.1fr_0.9fr_0.8fr]">
        <div>
          <p className="text-lg font-bold tracking-[0.14em]">{brand.name}</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-ivory/70">{brand.tagline}</p>
        </div>
        <nav className="grid grid-cols-2 gap-3 text-sm text-ivory/75">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-marigold">
              {item.label}
            </Link>
          ))}
          <Link href="/client-login" className="transition hover:text-marigold">
            Client Login
          </Link>
          <Link href="/admin/login" className="transition hover:text-marigold">
            Admin
          </Link>
        </nav>
        <div className="space-y-3 text-sm text-ivory/75">
          <p className="flex items-center gap-2">
            <MapPin size={16} /> {brand.city}
          </p>
          <a href={`mailto:${brand.email}`} className="flex items-center gap-2">
            <Mail size={16} /> {brand.email}
          </a>
          <Link href={brand.whatsappHref} className="flex items-center gap-2">
            <MessageCircle size={16} /> {brand.whatsapp}
          </Link>
          <p className="flex items-center gap-2">
            <AtSign size={16} /> {brand.instagram}
          </p>
        </div>
      </div>
    </footer>
  );
}
