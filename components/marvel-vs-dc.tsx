"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Sparkles, Shield, Zap, ArrowUpRight } from "lucide-react";
import type { Title } from "@/lib/model";

interface MarvelVsDcProps {
  marvelTitles?: Title[];
  dcTitles?: Title[];
  allTitles?: Title[];
}

export function MarvelVsDc({ marvelTitles, dcTitles, allTitles = [] }: MarvelVsDcProps) {
  const [mode, setMode] = useState<"compare" | "marvel" | "dc">("compare");

  // Curated Marvel content
  const displayMarvel = (marvelTitles && marvelTitles.length > 0)
    ? marvelTitles
    : allTitles.filter((t) =>
        /(marvel|avengers|iron man|thor|captain america|spider-man|spiderman|loki|guardians of the galaxy|black panther|doctor strange|ant-man|deadpool|wolverine|x-men)/i.test(
          t.title + " " + (t.category || "") + " " + (t.synopsis || ""),
        ),
      ).slice(0, 8);

  // Curated DC content
  const displayDc = (dcTitles && dcTitles.length > 0)
    ? dcTitles
    : allTitles.filter((t) =>
        /(dc|batman|superman|justice league|joker|aquaman|wonder woman|flash|green lantern|suicide squad|peacemaker|shazam|harley quinn|dark knight)/i.test(
          t.title + " " + (t.category || "") + " " + (t.synopsis || ""),
        ),
      ).slice(0, 8);

  return (
    <section className="relative w-full overflow-hidden bg-[#07080b] py-16 sm:py-24 border-b border-white/10">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-red-950/40 via-red-900/10 to-transparent" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-950/40 via-blue-900/10 to-transparent" />
      </div>

      {/* Header & Mode Switcher */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <p className="text-[11px] tracking-[0.25em] font-semibold text-white/50 uppercase flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-amber-400" />
              THE CINEMATIC SHOWDOWN
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white">
              Marvel <span className="text-white/40 italic font-serif text-2xl sm:text-3xl">vs</span> DC Universe
            </h2>
          </div>

          {/* Interactive Mode Controls */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md self-start md:self-auto">
            <button
              type="button"
              onClick={() => setMode("compare")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                mode === "compare"
                  ? "bg-white text-black shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Compare Universes
            </button>
            <button
              type="button"
              onClick={() => setMode("marvel")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                mode === "marvel"
                  ? "bg-gradient-to-r from-[#e50914] to-red-700 text-white shadow-md shadow-red-950/50"
                  : "text-red-400 hover:text-red-300"
              }`}
            >
              Marvel Universe
            </button>
            <button
              type="button"
              onClick={() => setMode("dc")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                mode === "dc"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-950/50"
                  : "text-blue-400 hover:text-blue-300"
              }`}
            >
              DC Universe
            </button>
          </div>
        </div>
      </div>

      {/* Main Split-Screen / Focused Container */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10">
        <div
          className={`grid gap-8 transition-all duration-700 ${
            mode === "compare"
              ? "grid-cols-1 lg:grid-cols-2"
              : mode === "marvel"
                ? "grid-cols-1"
                : "grid-cols-1"
          }`}
        >
          {/* LEFT: MARVEL ZONE */}
          {(mode === "compare" || mode === "marvel") && (
            <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-b from-[#1a0a0d] via-[#12080a] to-[#0a0507] border border-red-500/20 shadow-2xl shadow-red-950/30">
              {/* Marvel Ambient Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between gap-4 mb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-600 text-white text-[10px] font-bold tracking-widest uppercase">
                    <Shield size={12} /> MARVEL
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-2">
                    Marvel Cinematic Universe
                  </h3>
                  <p className="text-xs sm:text-sm text-red-200/70 mt-1">
                    Heroes, gods, and cosmic battles across infinite timelines.
                  </p>
                </div>
                <Link
                  href="/movies?q=Marvel"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs text-red-300 hover:text-white font-medium"
                >
                  All Marvel <ArrowUpRight size={14} />
                </Link>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 relative z-10">
                {displayMarvel.slice(0, mode === "marvel" ? 6 : 6).map((item) => (
                  <Link
                    key={item.id}
                    href={item.kind === "series" ? `/series/${item.id}` : `/movies/${item.id}`}
                    className="group relative rounded-2xl overflow-hidden bg-black/40 border border-red-500/15 hover:border-red-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-950/50 flex flex-col"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden bg-neutral-900 relative">
                      <img
                        src={item.poster || ""}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                        <span className="p-2 rounded-full bg-red-600 text-white shadow-lg">
                          <Play size={14} fill="currentColor" />
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#12080a]">
                      <h4 className="text-xs font-semibold text-white truncate group-hover:text-red-300 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        {item.year || 2026} · {item.quality || "1080p"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* RIGHT: DC ZONE */}
          {(mode === "compare" || mode === "dc") && (
            <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-b from-[#071324] via-[#050e1a] to-[#040810] border border-blue-500/20 shadow-2xl shadow-blue-950/30">
              {/* DC Ambient Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between gap-4 mb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 text-white text-[10px] font-bold tracking-widest uppercase">
                    <Zap size={12} /> DC
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-2">
                    DC Extended Universe
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-200/70 mt-1">
                    Gothic shadows, mythical gods, and dark knight legends.
                  </p>
                </div>
                <Link
                  href="/movies?q=DC"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white font-medium"
                >
                  All DC <ArrowUpRight size={14} />
                </Link>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 relative z-10">
                {displayDc.slice(0, mode === "dc" ? 6 : 6).map((item) => (
                  <Link
                    key={item.id}
                    href={item.kind === "series" ? `/series/${item.id}` : `/movies/${item.id}`}
                    className="group relative rounded-2xl overflow-hidden bg-black/40 border border-blue-500/15 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/50 flex flex-col"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden bg-neutral-900 relative">
                      <img
                        src={item.poster || ""}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                        <span className="p-2 rounded-full bg-blue-600 text-white shadow-lg">
                          <Play size={14} fill="currentColor" />
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#050e1a]">
                      <h4 className="text-xs font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        {item.year || 2026} · {item.quality || "1080p"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
