import type { Metadata } from "next";
import "./globals.css";
import { getSiteBrand } from "@/lib/site-content";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getSiteBrand();

  return {
    title: {
      default: `${brand.name} | Premium Wedding Photography`,
      template: `%s | ${brand.name}`
    },
    description:
      "Premium wedding photography, cinematic films, pre-wedding shoots, and private online gallery delivery from Jaipur, Rajasthan.",
    metadataBase: new URL(process.env.APP_URL || "http://localhost:3000")
  };
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
