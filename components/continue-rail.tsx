"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { history, type Progress } from "@/lib/storage";
import { titleHref } from "@/lib/curation";
import { Artwork } from "./artwork";
export function ContinueRail() {
  const [entries, setEntries] = useState<Progress[]>([]);
  useEffect(() => {
    const sync = () =>
      setEntries(
        history()
          .filter(
            (e) =>
              e.duration > 0 &&
              e.position > 5 &&
              e.position / e.duration < 0.95,
          )
          .slice(0, 6),
      );
    sync();
    window.addEventListener("pinflix-storage", sync);
    return () => window.removeEventListener("pinflix-storage", sync);
  }, []);
  if (!entries.length) return null;
  return (
    <section className="section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">RIGHT WHERE YOU LEFT OFF</p>
          <h2>Continue watching</h2>
        </div>
        <Link href="/my-list?tab=continue-watching" className="text-button">
          View history <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="continue-row">
        {entries.map((e) => (
          <Link
            key={`${e.title.id}:${e.season}:${e.episode}`}
            href={`${titleHref(e.title)}?resume=1${e.season ? `&season=${e.season}&episode=${e.episode}` : ""}`}
            className="continue-card"
          >
            <div className="continue-art">
              <Artwork src={e.title.backdrop || e.title.poster} alt="" />
              <span className="progress-line">
                <i style={{ width: `${(e.position / e.duration) * 100}%` }} />
              </span>
            </div>
            <h3>{e.title.title}</h3>
            <p>
              {e.episode ? `S${e.season} · E${e.episode} · ` : ""}
              {Math.ceil((e.duration - e.position) / 60)} min left
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
