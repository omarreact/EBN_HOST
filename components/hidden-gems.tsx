"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Play, Plus, Check, Star, ArrowUpRight, Compass } from "lucide-react";
import type { Title } from "@/lib/model";
import { SaveButton } from "./hero";

interface HiddenGemsProps {
  titles: Title[];
}

export function HiddenGems({ titles }: HiddenGemsProps) {
  // Select an editorial spotlight title (one with backdrop or rich synopsis)
  const spotlight = titles.find((t) => t.backdrop && t.synopsis) || titles[0];
  const rails = titles.filter((t) => t.id !== spotlight?.id).slice(0, 8);

  const tags = ["CULT CLASSIC", "CRITIC'S PICK", "HIDDEN GEM", "UNDERRATED MASTERPIECE", "REDISCOVERED"];

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-10 py-16 border-t border-white/5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-[11px] tracking-[0.25em] font-semibold text-[#c8d9b8] uppercase flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[#88b596]" />
            REDISCOVER & UNDER-THE-RADAR
          </p>
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-white">
            Great Stories Never Get Old.
          </h2>
          <p className="text-sm text-[#9da598] mt-2 max-w-xl">
            Overlooked gems, acclaimed classics, and cult favorites waiting to be uncovered.
          </p>
        </div>

        <Link
          href="/movies?category=Classics"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#88b596] hover:text-[#c8d9b8] transition-colors self-start md:self-end"
        >
          View Curated Collection <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Featured Editorial Spotlight + Discovery Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Editorial Spotlight Card (5 cols) */}
        {spotlight && (
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#181d19] to-[#0d100e] border border-white/10 p-6 sm:p-8 flex flex-col justify-between group shadow-2xl">
            <div className="absolute inset-0 z-0 opacity-30 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none">
              <img
                src={spotlight.backdrop || spotlight.poster || ""}
                alt=""
                className="w-full h-full object-cover filter blur-sm scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d100e] via-[#0d100e]/80 to-transparent" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#88b596]/15 border border-[#88b596]/30 text-[10px] font-bold tracking-wider text-[#a7d4b5] uppercase mb-6 backdrop-blur-sm">
                <Star size={12} fill="currentColor" />
                Editorial Spotlight
              </div>

              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden mb-6 border border-white/10 relative shadow-lg">
                <img
                  src={spotlight.backdrop || spotlight.poster || ""}
                  alt={spotlight.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>

              <div className="flex items-center gap-2 text-xs text-[#a0a89b] mb-2 font-medium">
                <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-semibold">
                  {spotlight.kind === "series" ? "SERIES" : "FILM"}
                </span>
                <span>{spotlight.year}</span>
                <span>•</span>
                <span>{spotlight.category || spotlight.genres?.[0] || "Drama"}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">
                {spotlight.title}
              </h3>

              <p className="text-sm text-[#bcc4b6] line-clamp-3 leading-relaxed mb-6 font-normal">
                {spotlight.synopsis || "An extraordinary cinematic masterpiece that rewards patient viewers with timeless visual mastery and emotional depth."}
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3 pt-4 border-t border-white/10">
              <Link
                href={spotlight.kind === "series" ? `/series/${spotlight.id}` : `/movies/${spotlight.id}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-[#eef5e6] transition-all duration-200 shadow-md"
              >
                <Play size={14} fill="currentColor" /> Watch Now
              </Link>
              <SaveButton title={spotlight} />
            </div>
          </div>
        )}

        {/* Discovery Rail (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-medium tracking-wider text-[#88b596] uppercase flex items-center gap-1.5">
              <Compass size={14} /> Curated Discoveries
            </span>
            <span className="text-xs text-[#70786d]">{rails.length} rare titles</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {rails.map((item, idx) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-[#88b596]/40 transition-all duration-300 hover:-translate-y-1 flex flex-col"
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
                  <div className="absolute top-2 left-2">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/75 text-[#c8d9b8] border border-white/10 backdrop-blur-md">
                      {tags[idx % tags.length]}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                    <span className="p-2 rounded-full bg-white text-black shadow-lg">
                      <Play size={13} fill="currentColor" />
                    </span>
                  </div>
                </Link>

                <div className="p-2.5 bg-[#101311] flex-1 flex flex-col justify-between">
                  <Link
                    href={item.kind === "series" ? `/series/${item.id}` : `/movies/${item.id}`}
                    className="text-xs font-semibold text-white line-clamp-1 hover:text-[#88b596] transition-colors"
                  >
                    {item.title}
                  </Link>
                  <div className="flex items-center justify-between text-[10px] text-[#788273] mt-1.5">
                    <span>{item.year || "Classic"}</span>
                    <span>{item.category || item.kind}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
