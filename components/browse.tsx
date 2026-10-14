"use client";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  RefreshCw,
  ArrowDown,
  Film,
} from "lucide-react";
import { api, type Catalogue, type Title } from "@/lib/model";
import { Card } from "./cards";
export function Browse({
  initial,
  kind,
  initialQuery = "",
  initialCategory = "",
  initialYear = "",
}: {
  initial: Catalogue;
  kind?: "movie" | "series";
  initialQuery?: string;
  initialCategory?: string;
  initialYear?: string;
}) {
  const [data, setData] = useState(initial);
  const [q, setQ] = useState(initialQuery);
  const [searchBy, setSearchBy] = useState("title");
  const [category, setCategory] = useState(initialCategory);
  const [year, setYear] = useState(initialYear);
  const [language, setLanguage] = useState("");
  const [quality, setQuality] = useState("");
  const [sort, setSort] = useState("recent");
  const [type, setType] = useState(kind || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const first = useRef(true);
  const [languageOptions, setLanguageOptions] = useState(() => initial.items.flatMap((t) => t.language ? [t.language] : []));
  const requestVersion = useRef(0);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const version = ++requestVersion.current;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setBusy(true);
      setError("");
      const p = new URLSearchParams();
      Object.entries({
        q: searchBy === "title" ? q : "",
        actor: searchBy === "actor" ? q : "",
        category,
        year,
        language,
        quality,
        sort,
        kind: type,
      }).forEach(([k, v]) => {
        if (v) p.set(k, v);
      });
      fetch(api("/catalogue?" + p), { signal: controller.signal })
        .then(async (r) => {
          if (!r.ok) throw new Error();
          return r.json();
        })
        .then((next: Catalogue) => {
          if (controller.signal.aborted || version !== requestVersion.current) return;
          setLanguageOptions((current) => [...new Set([...current, ...next.items.flatMap((t) => t.language ? [t.language] : [])])]);
          setData(next);
        })
        .catch((e) => {
          if (e.name !== "AbortError")
            setError("We could not load this collection. Please try again.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setBusy(false);
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, category, year, language, quality, sort, type, refresh, searchBy]);
  async function more() {
    const version = requestVersion.current;
    setBusy(true);
    setError("");
    const p = new URLSearchParams({ page: String(data.page + 1) });
    Object.entries({
      q: searchBy === "title" ? q : "",
      actor: searchBy === "actor" ? q : "",
      category,
      year,
      language,
      quality,
      sort,
      kind: type,
    }).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    try {
      const r = await fetch(api("/catalogue?" + p));
      if (!r.ok) throw new Error();
      const next: Catalogue = await r.json();
      if (version !== requestVersion.current) return;
      setLanguageOptions((current) => [...new Set([...current, ...next.items.flatMap((t) => t.language ? [t.language] : [])])]);
      setData({
        ...next,
        items: [
          ...new Map(
            [...data.items, ...next.items].map(
              (t) => [t.id, t] as [string, Title],
            ),
          ).values(),
        ],
      });
    } catch {
      if (version === requestVersion.current) setError("More titles could not be loaded. Try again.");
    } finally {
      if (version === requestVersion.current) setBusy(false);
    }
  }
  const categories = data.categories.filter(
    (c) => (!type || c.kind === type) && !c.mature,
  );
  const languages = [...languageOptions, ...(language ? [language] : [])].filter((value, i, values) => values.indexOf(value) === i).sort();
  return (
    <div className="page-content browse-page">
      <div className="page-title">
        <p className="eyebrow">YOUR NEXT GOOD FIND</p>
        <h1>
          {initialQuery
            ? "Search the stories"
            : kind === "series"
              ? "A season for everything."
              : kind === "movie"
                ? "A world in every frame."
                : "Discover something great."}
        </h1>
        <p>
          Explore{" "}
          {kind === "series"
            ? "series and seasons"
            : kind === "movie"
              ? "films from around the world"
              : "movies and series"}{" "}
          from the CineplexBD collection.
        </p>
      </div>
      <div className="filter-panel">
        <label className="browse-search">
          <Search size={20} />
          <input
            aria-label="Search catalogue"
            placeholder="Title, year, language…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <div className="filters">
          <SlidersHorizontal size={17} />
          <label>
            <span>Search by</span>
            <select
              aria-label="Search by"
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
            >
              <option value="title">Title / keywords</option>
              <option value="actor">Cast member</option>
            </select>
          </label>
          {!kind && (
            <label>
              <span>Type</span>
              <select
                aria-label="Content type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setCategory("");
                }}
              >
                <option value="">All stories</option>
                <option value="movie">Movies</option>
                <option value="series">Series</option>
              </select>
            </label>
          )}
          <label>
            <span>Collection</span>
            <select
              aria-label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All collections</option>
              {categories.map((c) => (
                <option key={c.kind + c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Year</span>
            <select
              aria-label="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Any year</option>
              {data.years.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Language</span>
            <select
              aria-label="Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="">All languages</option>
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Quality</span>
            <select
              aria-label="Quality"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            >
              <option value="">Any quality</option>
              {["4K", "1080P", "720P", "480P", "360P"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Sort</span>
            <select
              aria-label="Sort titles"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="recent">Recently added</option>
              <option value="year">Release year</option>
              <option value="title">Title A–Z</option>
            </select>
          </label>
          <button
            aria-label="Refresh collection"
            className="icon-button"
            onClick={() => setRefresh((n) => n + 1)}
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </div>
      <div className="results-heading">
        <span>
          {data.items.length} {data.items.length === 1 ? "story" : "stories"} in
          this selection
        </span>
        {busy && <span role="status">Finding stories…</span>}
      </div>
      {error && (
        <div role="alert" className="notice">
          {error}
          <button onClick={() => setRefresh((n) => n + 1)}>Try again</button>
        </div>
      )}
      <div className={"card-grid " + (busy ? "is-loading" : "")}>
        {data.items.map((t) => (
          <Card key={t.id} title={t} />
        ))}
      </div>
      {!data.items.length && !busy && (
        <div className="empty">
          <Film size={32} />
          <h2>No stories found</h2>
          <p>Try another title or broaden your filters.</p>
          <button
            className="secondary"
            onClick={() => {
              setQ("");
              setCategory("");
              setYear("");
              setLanguage("");
              setQuality("");
              setSearchBy("title");
              setSort("recent");
              setType(kind || "");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      {data.hasNext && (
        <div className="load-more">
          <button className="secondary" disabled={busy} onClick={more}>
            More stories <ArrowDown size={17} />
          </button>
        </div>
      )}
      {data.stale && (
        <p className="availability-note">
          Showing previously available titles while the collection reconnects.
        </p>
      )}
    </div>
  );
}
