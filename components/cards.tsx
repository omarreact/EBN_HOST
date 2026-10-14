"use client";
import { useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, Film } from "lucide-react";
import type { Title } from "@/lib/model";
import { titleHref } from "@/lib/curation";
import { Artwork } from "./artwork";
import { SaveButton } from "./hero";
export function Card({
  title: t,
  progress,
  subtitle,
}: {
  title: Title;
  progress?: number;
  subtitle?: string;
}) {
  return (
    <article className="card">
      <div className="card-art">
        <Link href={titleHref(t)} aria-label={`Explore ${t.title}`}>
          <Artwork src={t.poster} alt={t.title} />
          <span className="card-gradient" />
          <span className="card-hover">
            <ArrowUpRight size={20} />
          </span>
        </Link>
        {t.quality && <span className="card-format">{t.quality}</span>}
        <SaveButton title={t} compact />
        {progress !== undefined && (
          <span className="progress-line">
            <i style={{ width: `${Math.min(100, progress)}%` }} />
          </span>
        )}
      </div>
      <Link href={titleHref(t)}>
        <h3>{t.title}</h3>
      </Link>
      <p>
        {subtitle ||
          [
            t.year,
            t.genres[0] ||
              t.category ||
              (t.kind === "series" ? "TV Series" : "Movie"),
          ]
            .filter(Boolean)
            .join(" · ")}
      </p>
      {t.kind === "series" && t.seasons.length > 0 && (
        <small className="card-season">
          {t.seasons.length} {t.seasons.length === 1 ? "season" : "seasons"}
        </small>
      )}
    </article>
  );
}
export function Row({
  title,
  kicker,
  items,
  href,
}: {
  title: string;
  kicker?: string;
  items: Title[];
  href?: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const move = (dir: number) =>
    rail.current?.scrollBy({
      left: dir * rail.current.clientWidth * 0.8,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  return (
    <section className="section">
      <div className="section-heading">
        <div>
          {kicker && <p className="eyebrow">{kicker}</p>}
          <h2>{title}</h2>
        </div>
        <div className="rail-actions">
          {href && (
            <Link className="text-button" href={href}>
              View all <ArrowUpRight size={15} />
            </Link>
          )}
          {items.length > 0 && (
            <div className="rail-arrows">
              <button
                className="icon-button"
                aria-label={`Scroll ${title} left`}
                onClick={() => move(-1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                className="icon-button"
                aria-label={`Scroll ${title} right`}
                onClick={() => move(1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
      {items.length ? (
        <div ref={rail} className="card-row" tabIndex={0} aria-label={title}>
          {items.map((t) => (
            <Card key={t.id} title={t} />
          ))}
        </div>
      ) : (
        <div className="empty compact">
          <Film />
          <p>This collection is waiting for its next story.</p>
        </div>
      )}
    </section>
  );
}
