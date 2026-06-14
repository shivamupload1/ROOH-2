import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type PackageCardProps = {
  name: string;
  price: string;
  description: string;
  includes: string[];
  featured?: boolean;
  dark?: boolean;
};

export function PackageCard({ name, price, description, includes, featured, dark }: PackageCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border p-6",
        dark ? "border-ivory/15 bg-white/7 text-ivory" : "border-marigold/30 bg-white text-ink",
        featured && (dark ? "border-marigold bg-marigold/10" : "border-rust shadow-soft")
      )}
    >
      {featured ? (
        <p className={cn("mb-3 text-xs font-bold uppercase tracking-[0.22em]", dark ? "text-marigold" : "text-rust")}>
          Most requested
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold">{name}</h2>
      <p className={cn("mt-2 text-3xl font-bold", dark ? "text-marigold" : "text-rust")}>{price}</p>
      <p className={cn("mt-3 text-sm leading-6", dark ? "text-ivory/70" : "text-ink/65")}>{description}</p>
      <ul className="mt-5 space-y-3 text-sm">
        {includes.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <Check className={cn("mt-0.5 shrink-0", dark ? "text-marigold" : "text-sage")} size={17} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
