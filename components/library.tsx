"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Play, Trash2, X, ArrowUpRight, Clock, Film, Tv } from "lucide-react";
import { history, saved, removeProgress, removeSaved, type Progress } from "@/lib/storage";
import type { Title } from "@/lib/model";
import { Artwork } from "./artwork";

export function Library() {
  const [list, setList] = useState<Title[]>([]);
  const [inProgress, setInProgress] = useState<Progress[]>([]);
  const [tab, setTab] = useState<"watch-later" | "continue-watching">("watch-later");

  useEffect(() => {
    const sync = () => {
      setList(saved());
      const rawHistory = history();
      // Filter continue watching items that have valid progress (>5s and <95% completed)
      setInProgress(
        rawHistory.filter(
          (e) => e.duration > 0 && e.position > 5 && e.position / e.duration < 0.95,
        ),
      );
    };
    sync();
    window.addEventListener("pinflix-storage", sync);
    return () => window.removeEventListener("pinflix-storage", sync);
  }, []);

  const formatRemaining = (pos: number, dur: number) => {
    const remainingSecs = Math.max(0, dur - pos);
    const mins = Math.round(remainingSecs / 60);
    if (mins < 60) return `${mins}m left`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m left`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-12">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-8 mb-8">
        <p className="text-xs font-semibold tracking-widest text-[#88b596] uppercase mb-2">
          PERSONAL CINEMA ARCHIVE
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
          My Library
        </h1>
        <p className="text-sm text-[#9ea69a] mt-2 max-w-xl">
          Your saved stories, watchlists, and playback progress synced on this device.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 mb-8">
        <button
          type="button"
          onClick={() => setTab("watch-later")}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            tab === "watch-later"
              ? "border-white text-white font-bold"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          <Bookmark size={15} />
          <span>Watch Later</span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[11px] text-white/80">
            {list.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab("continue-watching")}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            tab === "continue-watching"
              ? "border-white text-white font-bold"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          <Clock size={15} />
          <span>Continue Watching</span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[11px] text-white/80">
            {inProgress.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Watch Later */}
      {tab === "watch-later" && (
        <>
          {list.length === 0 ? (
            <div className="py-24 text-center rounded-3xl bg-white/5 border border-white/10 max-w-xl mx-auto px-6">
              <Bookmark size={40} className="mx-auto text-white/30 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Your Watch Later list is empty</h2>
              <p className="text-xs sm:text-sm text-white/60 mb-6">
                Explore our catalogue and click &quot;My List&quot; to save movies and series for later viewing.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/movies"
                  className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all flex items-center gap-2"
                >
                  <Film size={14} /> Browse Movies
                </Link>
                <Link
                  href="/series"
                  className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <Tv size={14} /> Browse Series
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {list.map((item) => {
                const itemHref = item.kind === "series" ? `/series/${item.id}` : `/movies/${item.id}`;
                return (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden bg-neutral-900 relative">
                      <Artwork src={item.poster} alt={item.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                        <Link
                          href={itemHref}
                          className="p-2 rounded-full bg-white text-black shadow-lg hover:scale-105 transition-transform"
                        >
                          <Play size={14} fill="currentColor" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeSaved(item.id)}
                          aria-label={`Remove ${item.title} from list`}
                          className="p-2 rounded-full bg-black/70 text-white/80 hover:text-red-400 hover:bg-black transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-[#111413] flex-1 flex flex-col justify-between">
                      <Link
                        href={itemHref}
                        className="text-xs font-semibold text-white line-clamp-1 hover:text-[#88b596] transition-colors"
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-center justify-between text-[10px] text-white/50 mt-1.5">
                        <span>{item.year || "HD"}</span>
                        <span>{item.kind === "series" ? "Series" : "Movie"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Continue Watching */}
      {tab === "continue-watching" && (
        <>
          {inProgress.length === 0 ? (
            <div className="py-24 text-center rounded-3xl bg-white/5 border border-white/10 max-w-xl mx-auto px-6">
              <Clock size={40} className="mx-auto text-white/30 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">No incomplete watch history</h2>
              <p className="text-xs sm:text-sm text-white/60 mb-6">
                Titles you begin watching will automatically remember your exact position so you can pick right back up.
              </p>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all inline-flex items-center gap-2"
              >
                Go to Homepage <ArrowUpRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {inProgress.map((e) => {
                const percent = Math.min(100, Math.round((e.position / e.duration) * 100));
                const itemHref = e.title.kind === "series" ? `/series/${e.title.id}` : `/movies/${e.title.id}`;

                return (
                  <div
                    key={`${e.title.id}-${e.season}-${e.episode}`}
                    className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col"
                  >
                    {/* Backdrop / Poster Container */}
                    <div className="aspect-[16/9] w-full overflow-hidden bg-neutral-900 relative">
                      <Artwork src={e.title.backdrop || e.title.poster} alt={e.title.title} />

                      {/* Play overlay button */}
                      <Link
                        href={itemHref}
                        className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors"
                      >
                        <span className="p-3.5 rounded-full bg-white text-black shadow-xl group-hover:scale-110 transition-transform">
                          <Play size={18} fill="currentColor" />
                        </span>
                      </Link>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeProgress(e.title.id, e.season, e.episode)}
                        aria-label={`Remove ${e.title.title} from continue watching`}
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 text-white/70 hover:text-white hover:bg-black transition-colors"
                      >
                        <X size={14} />
                      </button>

                      {/* Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                        <div
                          className="h-full bg-[#88b596] transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="p-4 bg-[#111413] flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-[#88b596] font-semibold mb-1">
                          <span>
                            {e.title.kind === "series"
                              ? `Season ${e.season} • Episode ${e.episode}`
                              : "Feature Film"}
                          </span>
                          <span className="text-white/40">{percent}% watched</span>
                        </div>
                        <Link
                          href={itemHref}
                          className="text-sm font-semibold text-white line-clamp-1 hover:text-[#88b596] transition-colors"
                        >
                          {e.title.title}
                        </Link>
                      </div>

                      <div className="flex items-center justify-between text-xs text-white/40 mt-3 pt-2 border-t border-white/5">
                        <span>{formatRemaining(e.position, e.duration)}</span>
                        <Link
                          href={itemHref}
                          className="text-xs font-semibold text-white hover:text-[#88b596] transition-colors"
                        >
                          Resume →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
