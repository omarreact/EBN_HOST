"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { api, type Catalogue } from "@/lib/model";
import {
  QuerySchema,
  queryParams,
  type CatalogueFilters,
} from "@/lib/catalogue-query";
import { read, write } from "@/lib/storage";
import { Card } from "./cards";
export function Browse({
  initial,
  initialFilters,
  initialKind = "",
}: {
  initial: Catalogue;
  initialFilters: CatalogueFilters;
  initialKind?: "" | "movie" | "series";
}) {
  const [data, setData] = useState(initial);
  const [filters, setFilters] = useState(initialFilters);
  const [kind, setKind] = useState(initialKind);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const first = useRef(true);
  const version = useRef(0);
  const set = (key: keyof CatalogueFilters, value: string | number) =>
    setFilters((f) => ({
      ...f,
      [key]: value,
      ...(key !== "page" ? { page: 1 } : {}),
    }));
  useEffect(() => {
    const pop = () => {
      const p = new URLSearchParams(location.search);
      setFilters(QuerySchema.parse(Object.fromEntries(p)));
      setKind(
        p.get("kind") === "movie"
          ? "movie"
          : p.get("kind") === "series"
            ? "series"
            : "",
      );
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const current = ++version.current;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setBusy(true);
      setError("");
      const p = queryParams(filters, kind || undefined);
      const url = new URL(location.href);
      url.search = p.toString();
      window.history.replaceState(window.history.state, "", url);
      p.set("directory", "true");
      try {
        const r = await fetch(api("/catalogue?" + p), {
          signal: controller.signal,
        });
        if (!r.ok) throw new Error();
        const next: Catalogue = await r.json();
        if (current === version.current && !controller.signal.aborted)
          setData(next);
      } catch {
        if (!controller.signal.aborted)
          setError("Search could not connect. Please try again.");
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [filters, kind, revision]);
  const facets = data.facets || {
    languages: [],
    genres: [],
    countries: [],
    qualities: [],
  };
  const categories = [
    ...new Set(
      data.categories
        .filter((c) => !c.mature && (!kind || c.kind === kind))
        .map((c) => c.name),
    ),
  ];
  const field = (
    key: "year" | "category" | "language" | "quality",
    label: string,
    values: string[],
  ) => (
    <label className="filter-field">
      <span>{label}</span>
      <select
        aria-label={label}
        value={filters[key]}
        onChange={(e) => set(key, e.target.value)}
      >
        <option value="">Any {label.toLowerCase()}</option>
        {[...new Set([...values, ...(filters[key] ? [filters[key]] : [])])].map(
          (v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ),
        )}
      </select>
    </label>
  );
  return (
    <div className="page-content browse-page">
      <div className="page-title">
        <p className="eyebrow">LET CURIOSITY TAKE THE LEAD</p>
        <h1>
          Find your next
          <br />
          favourite<span className="title-period">.</span>
        </h1>
        <p>A good story is closer than you think. Search movies and series.</p>
      </div>
      <div className="directory-controls">
        <label className="directory-search">
          <Search size={20} />
          <input
            aria-label="Search catalogue"
            autoComplete="off"
            value={filters.q}
            maxLength={120}
            placeholder="A movie, a series, a whole new world…"
            onChange={(e) => set("q", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filters.q.trim()) {
                const recent = read<string[]>("search", []);
                write(
                  "search",
                  [
                    filters.q.trim(),
                    ...(Array.isArray(recent) ? recent : []).filter(
                      (s) => s !== filters.q.trim(),
                    ),
                  ].slice(0, 6),
                );
              }
            }}
          />
          {filters.q && (
            <button aria-label="Clear search" onClick={() => set("q", "")}>
              <X size={17} />
            </button>
          )}
        </label>
      </div>
      <div className="directory-filter-row search-filter-row">
        <label className="filter-field">
          <span>Type</span>
          <select
            aria-label="Content type"
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as typeof kind);
              setFilters((f) => ({ ...f, category: "", page: 1 }));
            }}
          >
            <option value="">Movies & series</option>
            <option value="movie">Movies</option>
            <option value="series">TV Series</option>
          </select>
        </label>
        {field("year", "Year", data.years.map(String))}
        {field("category", "Collection", categories)}
        {field("language", "Language", facets.languages)}
        {field("quality", "Quality", facets.qualities)}
        <label className="filter-field">
          <span>Sort</span>
          <select
            aria-label="Sort search results"
            value={filters.sort}
            onChange={(e) => set("sort", e.target.value)}
          >
            <option value="recent">Recently added</option>
            <option value="title">Title A–Z</option>
            <option value="title-desc">Title Z–A</option>
            <option value="year">Newest release</option>
            <option value="year-asc">Oldest release</option>
          </select>
        </label>
      </div>
      <div className="results-heading" role="status">
        <span>
          {busy
            ? "Finding stories…"
            : `${data.total ?? data.items.length} stories${filters.q ? ` for “${filters.q}”` : " in this selection"}`}
        </span>
        <span>PAGE {data.page}</span>
      </div>
      {error && (
        <div className="notice" role="alert">
          {error}
          <button onClick={() => setRevision((r) => r + 1)}>Try again</button>
        </div>
      )}
      <div className={`card-grid ${busy ? "is-loading" : ""}`} aria-busy={busy}>
        {data.items.map((t) => (
          <Card key={t.id} title={t} />
        ))}
      </div>
      {!data.items.length && !busy && (
        <div className="empty">
          <Search size={32} />
          <h2>No stories found.</h2>
          <p>Try another title, or give your search a little more room.</p>
          <button
            className="secondary"
            onClick={() => {
              setFilters(QuerySchema.parse({ sort: "recent" }));
              setKind("");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      <div className="pagination">
        <button
          className="secondary"
          disabled={busy || data.page <= 1}
          onClick={() => set("page", data.page - 1)}
        >
          <ChevronLeft size={15} /> Previous
        </button>
        <span>Page {data.page}</span>
        <button
          className="secondary"
          disabled={busy || !data.hasNext}
          onClick={() => set("page", data.page + 1)}
        >
          Next <ChevronRight size={15} />
        </button>
      </div>
      {data.stale && (
        <p className="availability-note">
          Showing the saved collection while the catalogue reconnects.
        </p>
      )}
    </div>
  );
}
