import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Title } from "@/lib/model";
import { titleHref } from "@/lib/curation";
import { Artwork } from "./artwork";
import { SaveButton } from "./hero";
export function HiddenGems({ titles }: { titles: Title[] }) {
  const [featured, ...others] = titles;
  return (
    <section className="section gems-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">OFF THE BEATEN PATH</p>
          <h2>Great stories never get old.</h2>
        </div>
        <Link href="/movies?yearTo=2019" className="text-button">
          Rediscover more <ArrowUpRight size={15} />
        </Link>
      </div>
      {featured ? (
        <div className="gems-grid">
          <article className="gem-feature">
            <Artwork src={featured.backdrop || featured.poster} alt="" />
            <div className="gem-shade" />
            <div className="gem-copy">
              <span className="label-tag">THE REDISCOVERY PICK</span>
              <h3>{featured.title}</h3>
              <p>
                {featured.synopsis ||
                  [featured.year, featured.category]
                    .filter(Boolean)
                    .join(" · ")}
              </p>
              <div className="actions">
                <Link className="primary light" href={titleHref(featured)}>
                  Take a closer look <ArrowUpRight size={16} />
                </Link>
                <SaveButton title={featured} compact />
              </div>
            </div>
          </article>
          <div className="gem-list">
            {others.slice(0, 4).map((t, i) => (
              <Link key={t.id} href={titleHref(t)} className="gem-list-item">
                <span className="gem-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="gem-mini-art">
                  <Artwork src={t.poster} alt="" />
                </div>
                <div>
                  <small>{t.year || "FROM THE ARCHIVE"}</small>
                  <h3>{t.title}</h3>
                  <p>{t.category || "Rediscover this story"}</p>
                </div>
                <ArrowUpRight size={17} />
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty compact">
          <p>More rediscoveries are on the way.</p>
        </div>
      )}
    </section>
  );
}
