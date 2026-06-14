"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type PortfolioItem = {
  title: string;
  category: string;
  image: string;
};

type PortfolioGridProps = {
  items: PortfolioItem[];
  compact?: boolean;
};

export function PortfolioGrid({ items, compact }: PortfolioGridProps) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((item) => item.category)))], [items]);
  const [activeCategory, setActiveCategory] = useState("All");
  const filteredItems = activeCategory === "All" ? items : items.filter((item) => item.category === activeCategory);

  return (
    <div>
      {!compact ? (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "shrink-0 rounded-md border px-4 py-2 text-sm font-semibold transition",
                activeCategory === category
                  ? "border-rust bg-rust text-white"
                  : "border-ink/10 bg-ivory text-ink/70 hover:border-rust hover:text-rust"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      ) : null}
      <div className="grid auto-rows-[240px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item, index) => (
          <article
            key={`${item.title}-${item.image}`}
            className={cn(
              "group relative overflow-hidden rounded-lg bg-ink",
              !compact && index % 5 === 0 ? "sm:row-span-2" : ""
            )}
          >
            <Image
              src={item.image}
              alt={`${item.title} photography`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-ivory">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-marigold">{item.category}</p>
              <h2 className="mt-1 text-xl font-semibold">{item.title}</h2>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
