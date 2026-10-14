"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { Search, X, SlidersHorizontal, ArrowUpDown, Film, Tv, Play, Plus, Check } from "lucide-react";
import type { Catalogue, Title } from "@/lib/model";
import { saved, toggleSave } from "@/lib/storage";

interface DirectoryListProps {
  initial: Catalogue;
  kind: "movie" | "series";
  initialCategory?: string;
  initialYear?: string;
}

const ALPHABET = ["#", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

export function DirectoryList({
  initial,
  kind,
  initialCategory = "",
  initialYear = "",
}: DirectoryListProps) {
  const [search, setSearch] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedQuality, setSelectedQuality] = useState("");
  const [sortBy, setSortBy] = useState<"title-asc" | "title-desc" | "year-desc" | "year-asc">("title-asc");

  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set(saved().map((t) => t.id)));

  const handleToggleSave = (e: React.MouseEvent, title: Title) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(title);
    setSavedIds(new Set(saved().map((t) => t.id)));
  };

  // Derive unique years and qualities from initial items
  const { categories, years, qualities } = useMemo(() => {
    const cats = new Set<string>();
    const yrs = new Set<number>();
    const quals = new Set<string>();

    initial.items.forEach((item) => {
      if (item.category) cats.add(item.category);
      if (item.year) yrs.add(item.year);
      if (item.quality) quals.add(item.quality);
    });

    return {
      categories: Array.from(cats).sort(),
      years: Array.from(yrs).sort((a, b) => b - a),
      qualities: Array.from(quals).sort(),
    };
  }, [initial.items]);

  // Filter items based on user criteria
  const filteredItems = useMemo(() => {
    let items = initial.items.filter((t) => (kind === "movie" ? t.kind !== "series" : t.kind === "series"));

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.language && t.language.toLowerCase().includes(q)),
      );
    }

    if (selectedCategory) {
      items = items.filter((t) => t.category === selectedCategory);
    }

    if (selectedYear) {
      items = items.filter((t) => String(t.year) === selectedYear);
    }

    if (selectedQuality) {
      items = items.filter((t) => t.quality === selectedQuality);
    }

    if (selectedLetter) {
      if (selectedLetter === "#") {
        items = items.filter((t) => /^[^a-zA-Z]/.test(t.title.trim()));
      } else {
        items = items.filter((t) => t.title.trim().toUpperCase().startsWith(selectedLetter));
      }
    }

    // Sort items
    return items.sort((a, b) => {
      if (sortBy === "title-asc") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "title-desc") {
        return b.title.localeCompare(a.title);
      }
      if (sortBy === "year-desc") {
        return (b.year || 0) - (a.year || 0);
      }
      if (sortBy === "year-asc") {
        return (a.year || 0) - (b.year || 0);
      }
      return 0;
    });
  }, [initial.items, kind, search, selectedCategory, selectedYear, selectedQuality, selectedLetter, sortBy]);

  // Group items by First Letter (A-Z, #) for directory view
  const groupedItems = useMemo(() => {
    const groups: Record<string, Title[]> = {};

    filteredItems.forEach((item) => {
      const firstChar = item.title.trim()[0]?.toUpperCase() || "#";
      const key = /[A-Z]/.test(firstChar) ? firstChar : "#";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return groups;
  }, [filteredItems]);

  const activeGroupKeys = useMemo(() => {
    return Object.keys(groupedItems).sort((a, b) => {
      if (a === "#") return -1;
      if (b === "#") return 1;
      return a.localeCompare(b);
    });
  }, [groupedItems]);

  const clearFilters = () => {
    setSearch("");
    setSelectedLetter(null);
    setSelectedCategory("");
    setSelectedYear("");
    setSelectedQuality("");
    setSortBy("title-asc");
  };

  const isFiltering = !!(search || selectedLetter || selectedCategory || selectedYear || selectedQuality);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-12">
      {/* Directory Header */}
      <div className="border-b border-white/10 pb-8 mb-8">
        <div className="flex items-center gap-3 text-xs tracking-widest text-[#88b596] font-semibold uppercase mb-2">
          {kind === "movie" ? <Film size={16} /> : <Tv size={16} />}
          <span>{kind === "movie" ? "FILM DIRECTORY" : "TELEVISION DIRECTORY"}</span>
          <span>•</span>
          <span className="text-white/60">{filteredItems.length} Available Titles</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          {kind === "movie" ? "Movies A–Z" : "TV Series A–Z"}
        </h1>
        <p className="text-sm text-[#9aa296] mt-2 max-w-2xl">
          Clean, text-first alphabetical directory for rapid discovery and direct streaming.
        </p>
      </div>

      {/* A–Z Quick Jump Bar */}
      <div className="sticky top-20 z-30 bg-[#0e110f]/95 backdrop-blur-md py-3 border-y border-white/10 mb-8 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          <button
            type="button"
            onClick={() => setSelectedLetter(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer ${
              selectedLetter === null
                ? "bg-white text-black shadow"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            ALL
          </button>
          {ALPHABET.map((char) => {
            const hasItems = char === "#" ? !!groupedItems["#"] : !!groupedItems[char];
            const isSelected = selectedLetter === char;
            return (
              <button
                key={char}
                type="button"
                onClick={() => setSelectedLetter(isSelected ? null : char)}
                disabled={!hasItems && !isSelected}
                className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white text-black shadow scale-105"
                    : hasItems
                    ? "text-white/90 hover:text-white hover:bg-white/10"
                    : "text-white/20 cursor-not-allowed"
                }`}
              >
                {char}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Search & Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
        {/* Live Search */}
        <div className="md:col-span-5 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${kind === "movie" ? "movies" : "series"} by title or genre...`}
            className="w-full bg-white/5 border border-white/15 focus:border-white/40 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/40 outline-none transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="md:col-span-7 flex flex-wrap items-center gap-2.5">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/40 cursor-pointer"
          >
            <option value="" className="bg-[#121513]">All Genres</option>
            {categories.map((c) => (
              <option key={c} value={c} className="bg-[#121513]">{c}</option>
            ))}
          </select>

          {/* Year */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/40 cursor-pointer"
          >
            <option value="" className="bg-[#121513]">All Years</option>
            {years.map((y) => (
              <option key={y} value={String(y)} className="bg-[#121513]">{y}</option>
            ))}
          </select>

          {/* Quality */}
          {qualities.length > 0 && (
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/40 cursor-pointer"
            >
              <option value="" className="bg-[#121513]">All Qualities</option>
              {qualities.map((q) => (
                <option key={q} value={q} className="bg-[#121513]">{q}</option>
              ))}
            </select>
          )}

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-white/40 cursor-pointer"
          >
            <option value="title-asc" className="bg-[#121513]">Title (A–Z)</option>
            <option value="title-desc" className="bg-[#121513]">Title (Z–A)</option>
            <option value="year-desc" className="bg-[#121513]">Release Year (Newest)</option>
            <option value="year-asc" className="bg-[#121513]">Release Year (Oldest)</option>
          </select>

          {/* Reset Filters */}
          {isFiltering && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-2 rounded-xl text-xs font-medium text-[#c8d9b8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Directory Listings - Clean Text-First Layout */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white/5 border border-white/10">
          <p className="text-base text-white/80 font-medium mb-2">No matching titles found.</p>
          <p className="text-xs text-white/50 mb-4">Try clearing or adjusting your search filters.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {activeGroupKeys.map((letterKey) => {
            const groupTitles = groupedItems[letterKey] || [];
            if (!groupTitles.length) return null;

            return (
              <section
                key={letterKey}
                id={`directory-section-${letterKey}`}
                className="scroll-mt-36"
              >
                {/* Letter Header */}
                <div className="flex items-center gap-4 pb-3 mb-3 border-b border-white/15">
                  <span className="text-3xl font-bold tracking-tight text-white/90 w-10">
                    {letterKey}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
                  <span className="text-xs font-medium text-white/40">
                    {groupTitles.length} {groupTitles.length === 1 ? "title" : "titles"}
                  </span>
                </div>

                {/* Clean Text-First List */}
                <div className="divide-y divide-white/5 bg-[#121614]/60 rounded-2xl border border-white/5 overflow-hidden">
                  {groupTitles.map((title) => {
                    const itemHref = kind === "series" ? `/series/${title.id}` : `/movies/${title.id}`;
                    const isSaved = savedIds.has(title.id);

                    return (
                      <div
                        key={title.id}
                        className="group flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors"
                      >
                        {/* Title link and metadata */}
                        <Link
                          href={itemHref}
                          className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 min-w-0 pr-4"
                        >
                          <span className="text-sm sm:text-base font-semibold text-white/90 group-hover:text-white transition-colors">
                            {title.title}
                          </span>

                          <div className="flex items-center gap-2 text-xs text-white/45 shrink-0">
                            {title.year && (
                              <span className="text-white/60 font-mono">({title.year})</span>
                            )}
                            {title.category && (
                              <>
                                <span>•</span>
                                <span>{title.category}</span>
                              </>
                            )}
                            {title.quality && (
                              <>
                                <span>•</span>
                                <span className="px-1.5 py-0.2 rounded border border-white/15 text-[10px] uppercase font-mono text-[#88b596]">
                                  {title.quality}
                                </span>
                              </>
                            )}
                          </div>
                        </Link>

                        {/* Quick actions: Play & Save */}
                        <div className="flex items-center gap-2 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleToggleSave(e, title)}
                            aria-label={isSaved ? "Remove from My List" : "Add to My List"}
                            className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                              isSaved
                                ? "text-[#88b596] bg-[#88b596]/15 hover:bg-[#88b596]/25"
                                : "text-white/50 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            {isSaved ? <Check size={15} /> : <Plus size={15} />}
                          </button>

                          <Link
                            href={itemHref}
                            className="p-2 rounded-lg text-white/70 hover:text-black hover:bg-white transition-all"
                            aria-label={`Play ${title.title}`}
                          >
                            <Play size={14} fill="currentColor" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
