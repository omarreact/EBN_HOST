"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import type { Title } from "@/lib/model";
import { saved, toggleSave } from "@/lib/storage";
import { titleHref } from "@/lib/curation";
import { Artwork } from "./artwork";
import { usePosterAmbient } from "./poster-ambient";
export function SaveButton({
  title,
  compact = false,
}: {
  title: Title;
  compact?: boolean;
}) {
  const [has, setHas] = useState(false);
  useEffect(() => {
    const sync = () => setHas(saved().some((t) => t.id === title.id));
    sync();
    window.addEventListener("pinflix-storage", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("pinflix-storage", sync);
      window.removeEventListener("storage", sync);
    };
  }, [title.id]);
  return (
    <button
      type="button"
      className={compact ? "save-compact" : "secondary"}
      aria-pressed={has}
      aria-label={`${has ? "Remove" : "Save"} ${title.title}${has ? " from" : " to"} Watch Later`}
      onClick={() => toggleSave(title)}
    >
      {has ? <Check size={18} /> : <Plus size={18} />}{" "}
      {!compact && (has ? "Saved to My List" : "Watch Later")}
    </button>
  );
}
export function Hero({ titles }: { titles: Title[] }) {
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reduced, setReduced] = useState(true);
  const index = selected % Math.max(1, titles.length);
  const title = titles[index];
  const accent = usePosterAmbient(title?.poster || title?.backdrop || null);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () =>
      setReduced(
        media.matches || document.documentElement.dataset.motion === "off",
      );
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("pinflix-preferences", sync);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("pinflix-preferences", sync);
    };
  }, []);
  useEffect(() => {
    if (paused || interacting || reduced || titles.length < 2) return;
    const timer = setInterval(() => {
      if (!document.hidden) setSelected((i) => (i + 1) % titles.length);
    }, 7500);
    return () => clearInterval(timer);
  }, [paused, interacting, reduced, titles.length]);
  if (!title)
    return (
      <section className="hero empty">
        <h1>Your next story awaits.</h1>
        <p>The collection is reconnecting. Try again shortly.</p>
      </section>
    );
  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Featured stories"
      style={{ "--accent": accent } as React.CSSProperties}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setInteracting(false);
      }}
    >
      <div className="hero-art" key={title.id}>
        <Artwork src={title.backdrop || title.poster} alt="" priority />
      </div>
      <div className="hero-shade" />
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-layout">
        <div className="hero-copy" key={`copy-${title.id}`}>
          <p className="eyebrow">
            <span className="spotlight-dot" /> IN THE SPOTLIGHT{" "}
            <span className="eyebrow-line" />
          </p>
          <div className="hero-meta">
            <span className="label-tag">
              {title.kind === "series" ? "TV SERIES" : "FEATURE FILM"}
            </span>
            {title.year && <span>{title.year}</span>}
            {title.genres.length > 0 && (
              <span>{title.genres.slice(0, 2).join(" · ")}</span>
            )}
            {title.runtime && <span>{title.runtime}</span>}
          </div>
          <h1>{title.title}</h1>
          <p className="hero-synopsis">
            {title.synopsis ||
              `Find your next story in ${title.category || "the PinFlix collection"}. Explore this ${title.kind === "series" ? "series" : "film"} and save it for your next movie night.`}
          </p>
          <div className="actions">
            <Link href={titleHref(title)} className="primary">
              Explore {title.kind === "series" ? "series" : "movie"}{" "}
              <ArrowUpRight size={18} />
            </Link>
            <SaveButton title={title} />
          </div>
          <p className="hero-caption">A world of stories. A moment for you.</p>
        </div>
        <div className="hero-thumbnails" aria-label="Choose featured title">
          <span className="thumbnail-heading">
            UP NEXT <span>{String(titles.length).padStart(2, "0")}</span>
          </span>
          {titles.map((item, i) => (
            <button
              type="button"
              key={item.id}
              className={`hero-thumbnail ${index === i ? "selected" : ""}`}
              aria-pressed={index === i}
              aria-label={`Feature ${item.title}`}
              onClick={() => setSelected(i)}
            >
              <div className="thumbnail-art">
                <Artwork src={item.backdrop || item.poster} alt="" />
                {index === i && <span className="thumbnail-selected-dot" />}
              </div>
              <span className="thumbnail-copy">
                <small>
                  {item.kind === "series" ? "SERIES" : "MOVIE"}
                  {item.year ? ` · ${item.year}` : ""}
                </small>
                <strong>{item.title}</strong>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="hero-bottom">
        <div className="hero-pagination">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div className="hero-pages">
            {titles.map((t, i) => (
              <button
                type="button"
                key={t.id}
                aria-label={`Go to slide ${i + 1}`}
                aria-pressed={index === i}
                onClick={() => setSelected(i)}
              >
                <i className={index === i ? "on" : ""} />
              </button>
            ))}
          </div>
          <span className="muted">
            {String(titles.length).padStart(2, "0")}
          </span>
        </div>
        <div className="hero-controls">
          <button
            className="icon-button"
            onClick={() =>
              setSelected((index - 1 + titles.length) % titles.length)
            }
            aria-label="Previous featured title"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="icon-button"
            aria-label={paused ? "Resume carousel" : "Pause carousel"}
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button
            className="icon-button"
            onClick={() => setSelected((index + 1) % titles.length)}
            aria-label="Next featured title"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
