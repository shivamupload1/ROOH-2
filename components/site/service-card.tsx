import type { LucideIcon } from "lucide-react";

type ServiceCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function ServiceCard({ title, description, icon: Icon }: ServiceCardProps) {
  return (
    <article className="rounded-lg border border-marigold/25 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-rust text-white">
        <Icon size={20} />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-ink/68">{description}</p>
    </article>
  );
}
