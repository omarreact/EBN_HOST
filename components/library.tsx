"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, ArrowUpRight } from "lucide-react";
import { history, saved, type Progress } from "@/lib/storage";
import type { Title } from "@/lib/model";
import { Card } from "./cards";
export function ContinueWatching() {
  const [entries, setEntries] = useState<Progress[]>([]);
  useEffect(() => {
    const sync = () =>
      setEntries(
        history().filter(
          (e) =>
            e.duration > 0 && e.position / e.duration < 0.95 && e.position > 5,
        ),
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
        <Link className="text-button" href="/library">
          Your space <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="card-row">
        {entries.map((e) => (
          <Card
            key={e.title.id + e.season + e.episode}
            title={e.title}
            progress={(e.position / e.duration) * 100}
          />
        ))}
      </div>
    </section>
  );
}
export function Library() {
  const [list, setList] = useState<Title[]>([]);
  const [recent, setRecent] = useState<Progress[]>([]);
  const [tab, setTab] = useState("list");
  useEffect(() => {
    const sync = () => {
      setList(saved());
      setRecent(history());
    };
    sync();
    window.addEventListener("pinflix-storage", sync);
    return () => window.removeEventListener("pinflix-storage", sync);
  }, []);
  const titles =
    tab === "list"
      ? list
      : [...new Map(recent.map((e) => [e.title.id, e.title])).values()];
  return (
    <div className="page-content browse-page">
      <div className="page-title">
        <p className="eyebrow">CURATED BY YOU</p>
        <h1>Your own little cinema.</h1>
        <p>Favourites and watching progress stay on this device.</p>
      </div>
      <ContinueWatching />
      <div className="tabs">
        <button
          className={tab === "list" ? "active" : ""}
          onClick={() => setTab("list")}
        >
          My List <span>{list.length}</span>
        </button>
        <button
          className={tab === "history" ? "active" : ""}
          onClick={() => setTab("history")}
        >
          Watch history <span>{recent.length}</span>
        </button>
      </div>
      {titles.length ? (
        <div className="card-grid">
          {titles.map((t) => (
            <Card key={t.id} title={t} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <Bookmark size={32} />
          <h2>
            {tab === "list"
              ? "Make it your collection."
              : "Your story starts here."}
          </h2>
          <p>
            {tab === "list"
              ? "Save a film or series and find it here whenever you’re ready."
              : "Titles you watch will appear here."}
          </p>
          <Link href="/movies" className="primary">
            Explore movies <ArrowUpRight size={17} />
          </Link>
        </div>
      )}
    </div>
  );
}
