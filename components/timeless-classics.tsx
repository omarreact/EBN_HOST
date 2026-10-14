"use client";

import { useState } from "react";
import Link from "next/link";
import { History, Play, Plus, ArrowUpRight } from "lucide-react";
import type { Title } from "@/lib/model";
import { SaveButton } from "./hero";

interface TimelessClassicsProps {
  titles: Title[];
}

export function TimelessClassics({ titles }: TimelessClassicsProps) {
  const [decade, setDecade] = useState<"all" | "pre80" | "80s" | "90s" | "00s">("all");

  const decades = [
    { id: "all", label: "All Classics" },
    { id: "pre80", label: "Before 1980" },
    { id: "80s", label: "1980s" },
    { id: "90s", label: "1990s" },
    { id: "00s", label: "2000s" },
  ] as const;

  const filtered = titles.filter((t) => {
    const y = t.year || 2000;
    if (decade === "all") return y <= 2012;
    if (decade === "pre80") return y < 1980;
    if (decade === "80s") return y >= 1980 && y < 1990;
    if (decade === "90s") return y >= 1990 && y < 2000;
    if (decade === "00s") return y >= 2000 && y <= 2010;
    return true;
  });

  const displayItems = filtered.length > 0 ? filtered : titles.slice(0, 8);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 py-14">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-[11px] tracking-[0.25em] font-semibold text-[#88b596] uppercase flex items-center gap-2 mb-2">
            <History size={14} />
            TIMELESS STORIES. UNFORGETTABLE LEGENDS.
          </p>
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-white">
            Golden Era & Modern Classics
          </h2>
        </div>

        {/* Decade Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          {decades.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDecade(d.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                decade === d.id
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Rail */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayItems.slice(0, 12).map((item) => (
          <div
            key={item.id}
            className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60 flex flex-col"
          >
            <Link
              href={item.kind === "series" ? `/series/${item.id}` : `/movies/${item.id}`}
              className="aspect-[2/3] w-full overflow-hidden bg-neutral-900 relative block"
            >
              <img
                src={item.poster || ""}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                <span className="p-2 rounded-full bg-white text-black shadow-lg">
                  <Play size={14} fill="currentColor" />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 text-white border border-white/20 backdrop-blur-sm">
                  {item.year || "Classic"}
                </span>
              </div>
            </Link>

            <div className="p-3 bg-[#111413] flex-1 flex flex-col justify-between">
              <div>
                <Link
                  href={item.kind === "series" ? `/series/${item.id}` : `/movies/${item.id}`}
                  className="text-xs font-semibold text-white line-clamp-1 hover:text-[#88b596] transition-colors block"
                >
                  {item.title}
                </Link>
                <p className="text-[10px] text-white/50 mt-0.5">
                  {item.category || (item.kind === "series" ? "TV Series" : "Feature Film")}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-white/40">{item.quality || "HD"}</span>
                <SaveButton title={item} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
