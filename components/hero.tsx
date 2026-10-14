"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus, Check, Play, ChevronUp, ChevronDown, Volume2, VolumeX } from "lucide-react";
import type { Title } from "@/lib/model";
import { saved, toggleSave } from "@/lib/storage";
import { Artwork } from "./artwork";

function hashAccent(src: string) {
  let hash = 0;
  for (let i = 0; i < src.length; i++) hash = (hash * 31 + src.charCodeAt(i)) >>> 0;
  const r = 100 + (hash % 100);
  const g = 110 + ((hash >> 4) % 90);
  const b = 130 + ((hash >> 8) % 80);
  return `${r}, ${g}, ${b}`;
}

export function useAccent(src: string | null) {
  const [accent, setAccent] = useState(() =>
    src && src.includes("image.tmdb.org") ? hashAccent(src) : "136, 181, 150",
  );
  useEffect(() => {
    if (!src || src.includes("image.tmdb.org")) return;
    let cancelled = false;
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onerror = () => {};
    im.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = 12;
        c.height = 12;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(im, 0, 0, 12, 12);
        const px = ctx.getImageData(0, 0, 12, 12).data;
        let r = 0,
          g = 0,
          b = 0,
          n = 0;
        for (let i = 0; i < px.length; i += 4) {
          if (px[i] + px[i + 1] + px[i + 2] > 100) {
            r += px[i];
            g += px[i + 1];
            b += px[i + 2];
            n++;
          }
        }
        if (n && !cancelled)
          setAccent(
            [r, g, b]
              .map((v) => Math.min(220, Math.max(95, Math.round(v / n))))
              .join(", "),
          );
      } catch {}
    };
    im.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);
  return accent;
}

export function SaveButton({ title }: { title: Title }) {
  const [has, setHas] = useState(false);
  useEffect(() => {
    const sync = () => setHas(saved().some((t) => t.id === title.id));
    sync();
    window.addEventListener("pinflix-storage", sync);
    return () => window.removeEventListener("pinflix-storage", sync);
  }, [title.id]);
  return (
    <button
      className="secondary"
      aria-pressed={has}
      onClick={() => toggleSave(title)}
    >
      {has ? <Check size={18} /> : <Plus size={18} />}{" "}
      {has ? "In My List" : "My List"}
    </button>
  );
}

export function Hero({ titles }: { titles: Title[] }) {
  const [selected, setSelected] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const t = titles[selected];
  const accent = useAccent(t?.poster || null);

  const nextSlide = useCallback(() => {
    if (!titles.length) return;
    setSelected((prev) => (prev + 1) % titles.length);
  }, [titles.length]);

  const prevSlide = useCallback(() => {
    if (!titles.length) return;
    setSelected((prev) => (prev - 1 + titles.length) % titles.length);
  }, [titles.length]);

  useEffect(() => {
    if (isPaused || titles.length <= 1) return;
    timerRef.current = setTimeout(() => {
      nextSlide();
    }, 7000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [selected, isPaused, nextSlide, titles.length]);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    // Only trigger if horizontal swipe is dominant and > 45px
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
      if (diffX > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!t)
    return (
      <section className="hero empty">
        <h1>Your next story awaits.</h1>
        <p>
          The catalogue is temporarily unavailable. Please try again shortly.
        </p>
      </section>
    );

  const routeHref = t.kind === "series" ? `/series/${t.id}` : `/movies/${t.id}`;

  return (
    <section
      className="hero relative min-h-[600px] lg:min-h-[700px] flex flex-col justify-between overflow-hidden touch-pan-y"
      style={{ "--accent": accent } as React.CSSProperties}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background artwork with smooth fade */}
      <div className="hero-art transition-opacity duration-1000">
        <Artwork src={t.backdrop || t.poster} alt="" priority />
      </div>
      <div className="hero-shade" />

      {/* Main hero content and right-side thumbnail strip */}
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-6 sm:px-12 pt-16 sm:pt-24 pb-8 flex-1 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
        {/* Left: Metadata & Call to Action */}
        <div className="hero-copy max-w-2xl !p-0">
          <p className="eyebrow flex items-center gap-2 mb-3">
            <span className="live-dot" /> THE PINFLIX SPOTLIGHT
          </p>
          <div className="hero-meta flex items-center gap-3 text-xs tracking-wider text-[#bdc4bb] mb-4">
            <span className="px-2 py-0.5 rounded border border-white/20 uppercase font-semibold">
              {t.kind === "series" ? "SERIES" : "FILM"}
            </span>
            <span>{t.year}</span>
            <span>•</span>
            <span className="text-[#88b596] font-medium">{t.quality || t.category || "HD"}</span>
            {t.language && (
              <>
                <span>•</span>
                <span>{t.language}</span>
              </>
            )}
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-5 leading-[1.05]">
            {t.title}
          </h1>

          <p className="hero-synopsis text-sm sm:text-base text-[#c5ccc0] max-w-xl line-clamp-3 leading-relaxed mb-8">
            {t.synopsis || [t.category, t.language].filter(Boolean).join(" · ")}
          </p>

          <div className="actions flex flex-wrap items-center gap-4">
            <Link
              href={routeHref}
              className="primary inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-[#eaf5de] transition-all duration-200 shadow-xl hover:scale-105"
            >
              <Play size={18} fill="currentColor" /> Play Now
            </Link>
            <SaveButton title={t} />
          </div>
        </div>

        {/* Right: Vertical thumbnail strip (Desktop) */}
        <div className="hidden lg:flex flex-col items-center gap-3 bg-black/40 backdrop-blur-md p-3.5 rounded-3xl border border-white/10 shadow-2xl">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous featured title"
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronUp size={20} />
          </button>

          <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-0.5 scrollbar-none">
            {titles.map((item, idx) => {
              const isActive = idx === selected;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(idx)}
                  className={`group relative flex items-center gap-3 p-2 rounded-2xl transition-all duration-300 text-left w-56 cursor-pointer border ${
                    isActive
                      ? "bg-white/15 border-white shadow-lg shadow-black/50"
                      : "bg-transparent border-transparent hover:bg-white/5 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
                    <img
                      src={item.poster || ""}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play size={14} fill="white" className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold tracking-wider text-[#88b596] uppercase block mb-0.5">
                      {item.kind === "series" ? "Series" : "Movie"}
                    </span>
                    <p className="text-xs font-semibold text-white truncate group-hover:text-white">
                      {item.title}
                    </p>
                    <span className="text-[11px] text-white/50 block mt-0.5">
                      {item.year || "HD"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next featured title"
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronDown size={20} />
          </button>
        </div>
      </div>

      {/* Bottom pagination & mobile indicators */}
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-6 sm:px-12 pb-6 flex items-center justify-between">
        <span className="hero-footnote hidden sm:inline-block text-[10px] tracking-[0.2em] text-[#889482] uppercase">
          STORIES WORTH STAYING IN FOR
        </span>

        {/* Mobile Horizontal Thumbnail Carousel */}
        <div className="flex lg:hidden items-center gap-2 overflow-x-auto py-2 w-full sm:w-auto scrollbar-none">
          {titles.map((x, i) => (
            <button
              key={x.id}
              onClick={() => setSelected(i)}
              className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all ${
                selected === i
                  ? "bg-white text-black font-bold shadow-md"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              <span>0{i + 1}</span>
              <span className="max-w-[120px] truncate">{x.title}</span>
            </button>
          ))}
        </div>

        {/* Desktop Line Progress */}
        <div className="hidden lg:flex hero-pages items-center gap-3">
          {titles.map((x, i) => (
            <button
              key={x.id}
              aria-label={"Feature " + x.title}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
              className="flex items-center gap-2 text-xs text-[#aeb6a8] hover:text-white transition-colors cursor-pointer"
            >
              <span>0{i + 1}</span>
              <i className={selected === i ? "on w-12 bg-white" : "w-6 bg-white/30"} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
