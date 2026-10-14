"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { Title } from "@/lib/model";
import { titleHref } from "@/lib/curation";
import { Artwork } from "./artwork";
import { CinematicVideo } from "./cinematic-video";
type Mode = "compare" | "marvel" | "dc";
type Filter = "all" | "movie" | "series" | "classic" | "release";
export function MarvelVsDc({
  marvelTitles,
  dcTitles,
  marvelVideo,
  dcVideo,
}: {
  marvelTitles: Title[];
  dcTitles: Title[];
  marvelVideo?: string;
  dcVideo?: string;
}) {
  const [mode, setMode] = useState<Mode>("compare");
  const [active, setActive] = useState<"marvel" | "dc" | null>(null);
  const [filters, setFilters] = useState<Record<"marvel" | "dc", Filter>>({
    marvel: "all",
    dc: "all",
  });
  return (
    <section className="universe-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            <Sparkles size={13} /> CHOOSE YOUR UNIVERSE
          </p>
          <h2>Two worlds. Infinite possibilities.</h2>
        </div>
        <div className="segmented" aria-label="Universe view">
          {(["compare", "marvel", "dc"] as Mode[]).map((m) => (
            <button
              key={m}
              aria-pressed={mode === m}
              onClick={() => {
                setMode(m);
                setActive(m === "compare" ? null : m);
              }}
            >
              {m === "compare" ? "Compare" : m === "marvel" ? "Marvel" : "DC"}
            </button>
          ))}
        </div>
      </div>
      <div className={`universe-grid mode-${mode}`}>
        {(["marvel", "dc"] as const)
          .filter((u) => mode === "compare" || mode === u)
          .map((u) => {
            const raw = u === "marvel" ? marvelTitles : dcTitles;
            const filter = filters[u];
            const titles = raw
              .filter((t) =>
                filter === "movie" || filter === "series"
                  ? t.kind === filter
                  : filter === "classic"
                    ? !!t.year && t.year < 2010
                    : true,
              )
              .sort((a, b) =>
                filter === "release"
                  ? (a.year || 2100) - (b.year || 2100)
                  : Number(b.providerId) - Number(a.providerId),
              );
            return (
              <div
                key={u}
                className={`universe-panel ${u} ${active === u ? "focused" : ""}`}
              >
                <CinematicVideo
                  poster={raw[0]?.backdrop || raw[0]?.poster || null}
                  url={u === "marvel" ? marvelVideo : dcVideo}
                  active={active === u}
                  label={`${u} promotional video`}
                />
                <div className="universe-shade" />
                <div className="universe-copy">
                  <span className="universe-kicker">
                    {u === "marvel"
                      ? "THE EXTRAORDINARY AWAITS"
                      : "LEGENDS LIVE HERE"}
                  </span>
                  <h3 className={`universe-wordmark ${u}`}>
                    {u === "marvel" ? "MARVEL" : "DC"}
                  </h3>
                  <p>
                    {u === "marvel"
                      ? "Ordinary people. Extraordinary heroes."
                      : "For the heroes. For the legends. For Gotham."}
                  </p>
                  <button
                    className="universe-explore"
                    aria-pressed={active === u}
                    onClick={() => setActive((a) => (a === u ? null : u))}
                  >
                    Explore {u === "marvel" ? "Marvel" : "DC"}{" "}
                    <ArrowUpRight size={18} />
                  </button>
                  <div
                    className="universe-filters"
                    aria-label={`${u} collections`}
                  >
                    {(
                      [
                        ["all", "All titles"],
                        ["movie", "Movies"],
                        ["series", "Series"],
                        ["classic", "Classics"],
                        ["release", "Release order"],
                      ] as [Filter, string][]
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        aria-pressed={filter === key}
                        onClick={() => setFilters((f) => ({ ...f, [u]: key }))}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="universe-cards">
                  {titles.length ? (
                    titles.slice(0, 6).map((t) => (
                      <Link
                        key={t.id}
                        className="universe-card"
                        href={titleHref(t)}
                      >
                        <Artwork src={t.poster} alt={t.title} />
                        <span>
                          <strong>{t.title}</strong>
                          <small>
                            {t.year || "Explore title"}{" "}
                            <ArrowUpRight size={13} />
                          </small>
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="universe-empty">
                      No titles in this selection yet.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
      </div>
      <p className="universe-footnote">
        Curated collections. PinFlix is an independent platform.
      </p>
    </section>
  );
}
