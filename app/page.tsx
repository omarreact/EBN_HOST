import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { catalogue, detail } from "@/lib/provider";
import { Hero } from "@/components/hero";
import { Row } from "@/components/cards";
import { PromoVideoSection } from "@/components/promo-video-section";
import { MarvelVsDc } from "@/components/marvel-vs-dc";
import { TimelessClassics } from "@/components/timeless-classics";
import { HiddenGems } from "@/components/hidden-gems";
import type { Title } from "@/lib/model";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [c, s] = await Promise.all([
    catalogue().catch(() => null),
    catalogue({ kind: "series" }).catch(() => null),
  ]);

  const movies = c?.items.filter((t) => t.kind === "movie") || [];
  const seriesMap = new Map<string, Title>();
  if (s?.items) {
    for (const item of s.items) seriesMap.set(item.id, item);
  }
  if (c?.items) {
    for (const item of c.items) {
      if (item.kind === "series" && !seriesMap.has(item.id)) {
        seriesMap.set(item.id, item);
      }
    }
  }
  const series = Array.from(seriesMap.values());

  // 1. Featured items for Hero Carousel
  const featuredCandidates: Title[] = [];
  const maxPairs = 4;
  for (let i = 0; i < maxPairs; i++) {
    if (movies[i]) featuredCandidates.push(movies[i]);
    if (series[i]) featuredCandidates.push(series[i]);
  }
  const topFeatured = featuredCandidates.slice(0, 6);
  const featured = await Promise.all(
    topFeatured.map((t) =>
      detail(t.id)
        .then((d) => d.title)
        .catch(() => t),
    ),
  );

  const categories = c?.categories || [];

  // Marvel vs DC Title filtering & curation
  const marvelKeywords = ["marvel", "spider-man", "spiderman", "avengers", "iron man", "thor", "captain america", "guardians of the galaxy", "doctor strange", "black panther", "deadpool", "wolverine", "x-men", "ant-man", "hulk", "loki", "wandavision", "hawkeye", "moon knight"];
  const dcKeywords = ["batman", "superman", "wonder woman", "aquaman", "flash", "joker", "justice league", "suicide squad", "peacemaker", "shazam", "black adam", "arrow", "gotham", "green lantern", "harley quinn"];

  const allItems = [...movies, ...series];

  let marvelTitles = allItems.filter((t) =>
    marvelKeywords.some((kw) => t.title.toLowerCase().includes(kw)),
  );
  let dcTitles = allItems.filter((t) =>
    dcKeywords.some((kw) => t.title.toLowerCase().includes(kw)),
  );

  // If real-time catalogue has limited matching titles, provide representative hero items
  if (marvelTitles.length < 4) {
    marvelTitles = [
      ...marvelTitles,
      ...movies.filter((t) => (t.category?.toLowerCase().includes("action") || t.category?.toLowerCase().includes("sci-fi")) && !marvelTitles.some((m) => m.id === t.id)),
    ].slice(0, 8);
  }

  if (dcTitles.length < 4) {
    dcTitles = [
      ...dcTitles,
      ...series.filter((t) => (t.category?.toLowerCase().includes("action") || t.category?.toLowerCase().includes("crime") || t.category?.toLowerCase().includes("adventure")) && !dcTitles.some((d) => d.id === t.id)),
    ].slice(0, 8);
  }

  // Section 6: Timeless Classics (older releases, <= 2014)
  let classics = allItems.filter((t) => t.year && t.year <= 2014);
  if (classics.length < 6) {
    classics = allItems.slice(20, 36);
  }

  // Section 7: Rediscover & Hidden Gems
  let hiddenGems = allItems.filter((t) => (t.synopsis && t.synopsis.length > 50) || t.backdrop);
  if (hiddenGems.length < 6) {
    hiddenGems = allItems.slice(10, 24);
  }

  return (
    <>
      {/* Section 1: Full-Screen Cinematic Hero Banner */}
      <Hero titles={featured} />

      <div className="page-content">
        {/* Quick Discovery Chips */}
        <div className="discovery-bar">
          <span>Find your kind of story</span>
          <div className="chips">
            {categories
              .filter((cat) => cat.kind === "movie" && !cat.mature)
              .slice(0, 8)
              .map((cat) => (
                <Link
                  key={cat.name}
                  href={"/movies?category=" + encodeURIComponent(cat.name)}
                >
                  {cat.name}
                </Link>
              ))}
            <Link href="/movies">
              All collections <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Section 2: Latest Movies Rail */}
        <Row
          kicker="LATEST MOVIES"
          title="New stories, new obsessions"
          items={movies.slice(0, 15)}
          href="/movies"
        />
      </div>

      {/* Section 3: Cinematic Promotional Video Experience */}
      <PromoVideoSection />

      <div className="page-content">
        {/* Section 4: Latest TV Series Rail */}
        <Row
          kicker="LATEST TV SERIES"
          title="Series to settle into"
          items={series.slice(0, 15)}
          href="/series"
        />

        {/* Section 5: MARVEL VS. DC: Cinematic Universe Experience */}
        <MarvelVsDc marvelTitles={marvelTitles} dcTitles={dcTitles} />

        {/* Section 6: Timeless Classics */}
        <TimelessClassics titles={classics} />

        {/* Section 7: Rediscover & Hidden Gems */}
        <HiddenGems titles={hiddenGems} />

        {c?.stale && (
          <p className="availability-note mt-8 mb-4">
            Showing the last available collection. More titles will return when
            the catalogue reconnects.
          </p>
        )}
      </div>
    </>
  );
}
