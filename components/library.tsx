"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bookmark, Clock, CloudOff, Trash2 } from "lucide-react";
import {
  history,
  saved,
  removeSaved,
  removeProgress,
  type Progress,
} from "@/lib/storage";
import type { Title } from "@/lib/model";
import { titleHref } from "@/lib/curation";
import { Card } from "./cards";
import { Artwork } from "./artwork";
import { CloudSyncBanner } from "./library-sync";
export function Library({
  initialTab = "watch-later",
}: {
  initialTab?: "watch-later" | "continue-watching";
}) {
  const [list, setList] = useState<Title[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [tab, setTab] = useState(initialTab);
  const [sort, setSort] = useState("recent");
  useEffect(() => {
    const sync = () => {
      setList(saved());
      setProgress(
        history().filter(
          (e) =>
            e.duration > 0 && e.position > 5 && e.position / e.duration < 0.95,
        ),
      );
    };
    sync();
    window.addEventListener("pinflix-storage", sync);
    window.addEventListener("storage", sync);
    const pop = () =>
      setTab(
        new URLSearchParams(location.search).get("tab") === "continue-watching"
          ? "continue-watching"
          : "watch-later",
      );
    window.addEventListener("popstate", pop);
    return () => {
      window.removeEventListener("pinflix-storage", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("popstate", pop);
    };
  }, []);
  const sorted = [...list].sort((a, b) =>
    sort === "title"
      ? a.title.localeCompare(b.title)
      : sort === "year"
        ? (b.year || 0) - (a.year || 0)
        : 0,
  );
  function selectTab(next: typeof tab) {
    setTab(next);
    const url = new URL(location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState(window.history.state, "", url);
  }
  return (
    <div className="page-content library-page">
      <div className="page-title">
        <p className="eyebrow">YOUR OWN LITTLE CINEMA</p>
        <h1>
          My List<span className="title-period">.</span>
        </h1>
        <p>Stories you’ve saved. Moments you’ll come back to.</p>
      </div>
      <div
        className="library-tabs"
        role="tablist"
        aria-label="Personal library"
        onKeyDown={(e) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key))
            return;
          e.preventDefault();
          const next =
            e.key === "Home"
              ? "watch-later"
              : e.key === "End"
                ? "continue-watching"
                : tab === "watch-later"
                  ? "continue-watching"
                  : "watch-later";
          selectTab(next);
          const buttons =
            e.currentTarget.querySelectorAll<HTMLButtonElement>("button");
          buttons[next === "watch-later" ? 0 : 1]?.focus();
        }}
      >
        <button
          role="tab"
          aria-selected={tab === "watch-later"}
          tabIndex={tab === "watch-later" ? 0 : -1}
          aria-controls="library-content"
          onClick={() => selectTab("watch-later")}
        >
          <Bookmark size={16} /> Watch Later{" "}
          <span className="count-badge">{list.length}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === "continue-watching"}
          tabIndex={tab === "continue-watching" ? 0 : -1}
          aria-controls="library-content"
          onClick={() => selectTab("continue-watching")}
        >
          <Clock size={16} /> Continue Watching{" "}
          <span className="count-badge">{progress.length}</span>
        </button>
      </div>
      <div
        id="library-content"
        role="tabpanel"
        aria-label={tab === "watch-later" ? "Watch Later" : "Continue Watching"}
      >
        <div className="library-toolbar">
          <span>
            {tab === "watch-later" ? list.length : progress.length}{" "}
            {tab === "watch-later" ? "saved stories" : "stories in progress"}
          </span>
          {tab === "watch-later" && (
            <select
              aria-label="Sort saved stories"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="recent">Recently saved</option>
              <option value="title">Title A–Z</option>
              <option value="year">Newest release</option>
            </select>
          )}
        </div>
        {tab === "watch-later" ? (
          list.length ? (
            <div className="library-grid">
              {sorted.map((t) => (
                <article key={t.id}>
                  <Card title={t} />
                  <button
                    className="library-remove"
                    aria-label={`Remove ${t.title} from Watch Later`}
                    onClick={() => removeSaved(t.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">
              <Bookmark size={32} strokeWidth={1} />
              <h2>Your next movie night starts here.</h2>
              <p>
                Save a movie or series with the + button. Your stories will be
                waiting here.
              </p>
              <Link href="/movies" className="primary">
                Explore movies <ArrowUpRight size={16} />
              </Link>
            </div>
          )
        ) : progress.length ? (
          <div className="library-continue-grid">
            {progress.map((e) => (
              <article
                key={`${e.title.id}:${e.season}:${e.episode}`}
                className="library-progress-card"
              >
                <Link
                  href={`${titleHref(e.title)}?resume=1${e.season ? `&season=${e.season}&episode=${e.episode}` : ""}`}
                  className="continue-art"
                >
                  <Artwork
                    src={e.title.backdrop || e.title.poster}
                    alt={e.title.title}
                  />
                  <span className="progress-line">
                    <i
                      style={{ width: `${(e.position / e.duration) * 100}%` }}
                    />
                  </span>
                </Link>
                <button
                  className="library-remove"
                  aria-label={`Remove ${e.title.title} from Continue Watching`}
                  onClick={() =>
                    removeProgress(e.title.id, e.season, e.episode)
                  }
                >
                  <Trash2 size={13} />
                </button>
                <Link
                  href={`${titleHref(e.title)}?resume=1${e.season ? `&season=${e.season}&episode=${e.episode}` : ""}`}
                >
                  <h3>{e.title.title}</h3>
                </Link>
                <p>
                  {e.episode
                    ? `Season ${e.season} · Episode ${e.episode}`
                    : "Movie"}
                </p>
                <div className="progress-summary">
                  <span>
                    {Math.round((e.position / e.duration) * 100)}% watched ·{" "}
                    {Math.ceil((e.duration - e.position) / 60)} min left
                  </span>
                  <span>
                    {new Date(e.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <Clock size={32} strokeWidth={1} />
            <h2>Pick up where you left off.</h2>
            <p>
              Once you start a story, we’ll keep your place here. Finished
              stories leave this list automatically.
            </p>
            <Link href="/series" className="primary">
              Explore series <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
      </div>
      <p className="library-sync">
        <CloudOff size={13} /> Your list and progress stay on this device unless
        you connect account sync.
      </p>
      <CloudSyncBanner />
    </div>
  );
}
