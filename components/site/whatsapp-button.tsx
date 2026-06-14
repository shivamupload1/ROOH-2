import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { brand } from "@/lib/content";

export function WhatsAppButton() {
  return (
    <Link
      href={brand.whatsappHref}
      className="fixed bottom-4 right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-md bg-rust text-white shadow-soft transition hover:bg-rosewood"
      aria-label="Book on WhatsApp"
      title="Book on WhatsApp"
    >
      <MessageCircle size={22} />
    </Link>
  );
}
