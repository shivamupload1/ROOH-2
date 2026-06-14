import Link from "next/link";
import { Images, MessageCircle } from "lucide-react";
import { navItems } from "@/lib/content";
import type { SiteBrand } from "@/lib/site-content";

export function Navbar({ brand }: { brand: SiteBrand }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <p className="truncate text-base font-bold tracking-[0.14em] text-ink">{brand.name}</p>
          <p className="hidden text-xs text-rust sm:block">{brand.tagline}</p>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-ink/70 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-rust">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/client-login"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink/10 text-ink md:hidden"
            aria-label="Client gallery access"
            title="Client gallery access"
          >
            <Images size={18} />
          </Link>
          <Link
            href={brand.whatsappHref}
            className="hidden items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-ivory sm:inline-flex"
          >
            <MessageCircle size={17} />
            WhatsApp
          </Link>
        </div>
      </div>
    </header>
  );
}
