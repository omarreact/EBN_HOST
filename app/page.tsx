import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { catalogue, detail } from "@/lib/provider";
import { Hero } from "@/components/hero";
import { Row } from "@/components/cards";
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

  const featuredCandidates: Title[] = [];
  const maxPairs = 3;
  for (let i = 0; i < maxPairs; i++) {
    if (movies[i]) featuredCandidates.push(movies[i]);
    if (series[i]) featuredCandidates.push(series[i]);
  }
  const topFeatured = featuredCandidates.slice(0, 5);
  const featured = await Promise.all(
    topFeatured.map((t) =>
      detail(t.id)
        .then((d) => d.title)
        .catch(() => t),
    ),
  );
  const categories = c?.categories || [];
  return (
    <>
      <Hero titles={featured} />
      <div className="page-content">
        <div className="discovery-bar">
          <span>Find your kind of story</span>
          <div className="chips">
            {categories
              .filter((c) => c.kind === "movie" && !c.mature)
              .slice(0, 8)
              .map((c) => (
                <Link
                  key={c.name}
                  href={"/movies?category=" + encodeURIComponent(c.name)}
                >
                  {c.name}
                </Link>
              ))}
            <Link href="/movies">
              All collections <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <Row
          kicker="FRESH ON THE SHELF"
          title="New stories, new obsessions"
          items={movies.slice(0, 12)}
          href="/movies"
        />
        <section className="editorial">
          <div>
            <p className="eyebrow">ONE EPISODE IS NEVER ENOUGH</p>
            <h2>
              Make room for
              <br />a longer story.
            </h2>
            <p>Explore series, discover seasons and keep your place.</p>
            <Link className="primary" href="/series">
              Find a series <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="editorial-posters">
            {series.slice(0, 3).map((t) => (
              <Link key={t.id} href={"/title/" + t.id}>
                <img src={t.poster || ""} alt={t.title} loading="lazy" />
              </Link>
            ))}
          </div>
        </section>
        <Row
          kicker="THE NEXT CHAPTER"
          title="Series to settle into"
          items={series.slice(0, 12)}
          href="/series"
        />
        <Row
          kicker="MORE TO DISCOVER"
          title="Go beyond the familiar"
          items={movies.slice(12, 24)}
          href="/movies"
        />
        {c?.stale && (
          <p className="availability-note">
            Showing the last available collection. More titles will return when
            the catalogue reconnects.
          </p>
        )}
      </div>
    </>
  );
}
