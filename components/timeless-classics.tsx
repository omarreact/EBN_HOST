"use client";
import { useState } from "react";
import type { Title } from "@/lib/model";
import { Card } from "./cards";
export function TimelessClassics({ titles }: { titles: Title[] }) {
  const [decade, setDecade] = useState("all");
  const options = [
    ["all", "All classics"],
    ["pre80", "Before 1980"],
    ["80s", "1980s"],
    ["90s", "1990s"],
    ["00s", "2000s"],
  ];
  const filtered = titles.filter((t) => {
    if (!t.year) return false;
    return decade === "all"
      ? t.year < 2010
      : decade === "pre80"
        ? t.year < 1980
        : decade === "80s"
          ? t.year >= 1980 && t.year < 1990
          : decade === "90s"
            ? t.year >= 1990 && t.year < 2000
            : t.year >= 2000 && t.year < 2010;
  });
  return (
    <section className="section classics">
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE GOOD ONES NEVER FADE</p>
          <h2>
            Timeless stories.
            <br />
            <span className="muted">Unforgettable legends.</span>
          </h2>
        </div>
        <span className="classics-number" aria-hidden="true">
          ∞
        </span>
      </div>
      <div className="chips decade-tabs">
        {options.map(([id, label]) => (
          <button
            key={id}
            aria-pressed={decade === id}
            onClick={() => setDecade(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {filtered.length ? (
        <div className="card-row">
          {filtered.map((t) => (
            <Card key={t.id} title={t} />
          ))}
        </div>
      ) : (
        <div className="empty compact">
          <p>No titles from this decade are in the current collection.</p>
          <button className="text-button" onClick={() => setDecade("all")}>
            See all classics
          </button>
        </div>
      )}
    </section>
  );
}
