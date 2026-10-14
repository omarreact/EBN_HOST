"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  Download,
  LoaderCircle,
  Play,
  Film,
} from "lucide-react";
import { api, type Detail, type Playback } from "@/lib/model";
import { history, type Progress } from "@/lib/storage";
import { Artwork } from "./artwork";
import { SaveButton, useAccent } from "./hero";
import { Row } from "./cards";
import { PlaybackSlot, usePlayback } from "./playback-context";
export function DetailView({
  initial,
  initialPlayback,
  initialEpisode,
  resumeRequested = false,
}: {
  initial: Detail;
  initialPlayback: Playback;
  initialEpisode?: number;
  resumeRequested?: boolean;
}) {
  const [data, setData] = useState(initial);
  const [season, setSeason] = useState(initial.season);
  const [episode, setEpisode] = useState(initialEpisode || 0);
  const [source, setSource] = useState(initialPlayback);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [progress, setProgress] = useState<Progress[]>([]);
  const [gate, setGate] = useState(!initial.title.mature);
  const requests = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const { session, open, minimized, close } = usePlayback();
  const t = data.title;
  const accent = useAccent(t.poster);
  const latest = progress.find(
    (p) =>
      p.season === season &&
      p.position > 5 &&
      p.duration > 0 &&
      p.position / p.duration < 0.95,
  );
  const effectiveEpisode =
    episode ||
    (latest?.episode && data.episodes.some((e) => e.number === latest.episode)
      ? latest.episode
      : data.episodes[0]?.number || 1);
  const same = session?.title.id === t.id;
  const selectedEpisode = same
    ? session.episode || effectiveEpisode
    : effectiveEpisode;
  const currentSeason = same ? session.season || season : season;
  useEffect(() => {
    const state = requests;
    const sync = () =>
      setProgress(history().filter((e) => e.title.id === initial.title.id));
    sync();
    window.addEventListener("pinflix-storage", sync);
    return () => {
      window.removeEventListener("pinflix-storage", sync);
      abort.current?.abort();
      state.current++;
    };
  }, [initial.title.id]);
  async function play(ep = effectiveEpisode) {
    const version = ++requests.current;
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setEpisode(ep);
    setBusy(true);
    setNote("");
    try {
      const r = await fetch(
        api(
          "/playback?" +
            new URLSearchParams({
              id: t.id,
              season: String(season),
              episode: String(ep),
            }),
        ),
        { signal: controller.signal },
      );
      if (!r.ok) throw new Error();
      const pb: Playback = await r.json();
      if (version !== requests.current || controller.signal.aborted) return;
      setSource(pb);
      if (pb.status === "ready" && pb.url) {
        open({
          title: t,
          source: pb,
          season: t.kind === "series" ? season : undefined,
          episode: t.kind === "series" ? ep : undefined,
          episodes: data.episodes,
        });
      } else setNote(pb.message || "Playback is unavailable for this title.");
    } catch {
      if (!controller.signal.aborted)
        setNote("Playback could not connect. Please try again.");
    } finally {
      if (version === requests.current) setBusy(false);
    }
  }
  async function changeSeason(n: number) {
    const version = ++requests.current;
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setSeason(n);
    setBusy(true);
    setNote("");
    if (same) close();
    try {
      const r = await fetch(
        api("/detail?" + new URLSearchParams({ id: t.id, season: String(n) })),
        { signal: controller.signal },
      );
      if (!r.ok) throw new Error();
      const d: Detail = await r.json();
      if (version !== requests.current) return;
      setData(d);
      setEpisode(d.episodes[0]?.number || 1);
    } catch {
      if (!controller.signal.aborted) {
        setSeason(data.season);
        setNote("This season could not be loaded. Please try again.");
      }
    } finally {
      if (version === requests.current) setBusy(false);
    }
  }
  const entry = progress.find(
    (e) =>
      e.season === (t.kind === "series" ? season : undefined) &&
      e.episode === (t.kind === "series" ? effectiveEpisode : undefined),
  );
  const canResume =
    entry && entry.position > 5 && entry.position / entry.duration < 0.95;
  if (!gate)
    return (
      <div className="page-content empty error-page">
        <h1>Mature content</h1>
        <p>Continue only if you meet the local age requirement.</p>
        <button className="primary" onClick={() => setGate(true)}>
          I meet the age requirement
        </button>
        <Link href="/">Go back</Link>
      </div>
    );
  return (
    <>
      <div className="detail-heading page-content">
        <Link href={t.kind === "series" ? "/series/" : "/movies/"}>
          <ArrowLeft size={16} /> Back to{" "}
          {t.kind === "series" ? "series" : "movies"}
        </Link>
        <span>
          {t.kind === "series" ? "THE NEXT CHAPTER" : "BEHIND THE STORY"}
        </span>
      </div>
      <section
        className={`detail-hero ${same ? "has-playback" : ""}`}
        style={{ "--accent": accent } as React.CSSProperties}
      >
        {same ? (
          <>
            <PlaybackSlot />
            {minimized && (
              <div className="minimized-placeholder">
                <Film size={32} />
                <h2>Your story is still playing.</h2>
                <p>Use the mini-player to expand or close playback.</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="detail-art">
              <Artwork src={t.backdrop || t.poster} alt="" priority />
            </div>
            <div className="hero-shade" />
            <div className="detail-copy">
              <p className="eyebrow">
                {t.kind === "series" ? "TV SERIES" : "FEATURE FILM"}
                {t.category ? ` / ${t.category}` : ""}
              </p>
              <h1>{t.title}</h1>
              <div className="detail-meta">
                {[
                  t.year,
                  t.runtime,
                  t.quality,
                  t.rating ? `★ ${t.rating}` : null,
                  ...t.genres.slice(0, 2),
                ]
                  .filter(Boolean)
                  .map((v, i) => (
                    <span key={i}>{v}</span>
                  ))}
              </div>
              <p className="hero-synopsis">
                {t.synopsis ||
                  "Explore this story from the PinFlix collection. Save it to your list and return when you’re ready."}
              </p>
              <div className="actions">
                <button
                  className="primary"
                  disabled={busy || source.status !== "ready"}
                  onClick={() => void play()}
                >
                  {busy ? (
                    <LoaderCircle size={18} className="spin" />
                  ) : (
                    <Play size={17} fill="currentColor" />
                  )}
                  {source.status !== "ready"
                    ? "Playback unavailable"
                    : canResume || resumeRequested
                      ? "Resume watching"
                      : t.kind === "series"
                        ? `Play S${season} · E${effectiveEpisode}`
                        : "Play movie"}
                </button>
                <SaveButton title={t} />
                {source.status === "ready" && source.download && (
                  <a className="secondary" href={source.download.url} download>
                    <Download size={17} /> Download
                    {source.download.quality
                      ? ` · ${source.download.quality}`
                      : ""}
                  </a>
                )}
              </div>
              {source.status !== "ready" && (
                <p className="playback-note" role="status">
                  {source.message || "Streaming is unavailable for this title."}
                </p>
              )}
              {note && (
                <p className="playback-note" role="alert">
                  {note}
                </p>
              )}
            </div>
          </>
        )}
      </section>
      <div className="page-content">
        <div className="detail-info">
          <div className="detail-poster">
            <Artwork src={t.poster} alt={t.title} />
          </div>
          <div>
            <p className="eyebrow">THE STORY</p>
            <h2>
              {t.kind === "series"
                ? "A world to return to."
                : "More than a movie."}
            </h2>
            <p>
              {t.synopsis || "A synopsis has not been supplied for this title."}
            </p>
          </div>
          <dl>
            {t.genres.length > 0 && (
              <>
                <dt>Genre</dt>
                <dd>{t.genres.join(", ")}</dd>
              </>
            )}
            {t.cast.length > 0 && (
              <>
                <dt>Starring</dt>
                <dd>{t.cast.slice(0, 8).join(", ")}</dd>
              </>
            )}
            {t.language && (
              <>
                <dt>Language</dt>
                <dd>{t.language}</dd>
              </>
            )}
            {t.year && (
              <>
                <dt>Released</dt>
                <dd>{t.year}</dd>
              </>
            )}
            {t.seasons.length > 0 && (
              <>
                <dt>Seasons</dt>
                <dd>{t.seasons.length}</dd>
              </>
            )}
            {t.seriesStatus && (
              <>
                <dt>Status</dt>
                <dd>
                  {t.seriesStatus === "ongoing" ? "Ongoing" : "Completed"}
                </dd>
              </>
            )}
          </dl>
        </div>
        {t.kind === "series" && (
          <section className="section episode-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">YOUR NEXT CHAPTER</p>
                <h2>
                  Episodes{" "}
                  <span className="muted">
                    / {String(data.episodes.length).padStart(2, "0")}
                  </span>
                </h2>
              </div>
              <label className="season-select">
                Season{" "}
                <select
                  aria-label="Select season"
                  value={season}
                  disabled={busy}
                  onChange={(e) => void changeSeason(Number(e.target.value))}
                >
                  {(t.seasons.length ? t.seasons : [season]).map((n) => (
                    <option key={n} value={n}>
                      Season {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {note && (
              <div className="notice" role="status">
                {note}
              </div>
            )}
            <div className="episodes" aria-busy={busy}>
              {data.episodes.map((e) => {
                const p = progress.find(
                  (p) => p.season === season && p.episode === e.number,
                );
                const watched =
                  !!p && p.duration > 0 && p.position / p.duration >= 0.95;
                const selected =
                  currentSeason === season && selectedEpisode === e.number;
                return (
                  <article
                    key={e.number}
                    className={`episode ${selected ? "active" : ""}`}
                  >
                    <span className="episode-number">
                      {String(e.number).padStart(2, "0")}
                    </span>
                    <div className="episode-art">
                      <Artwork src={e.thumbnail || t.poster} alt="" />
                      {p && p.duration > 0 && (
                        <span className="progress-line">
                          <i
                            style={{
                              width: `${Math.min(100, (p.position / p.duration) * 100)}%`,
                            }}
                          />
                        </span>
                      )}
                    </div>
                    <div className="episode-copy">
                      <small>
                        SEASON {season} · EPISODE {e.number}
                        {e.quality ? ` · ${e.quality}` : ""}
                      </small>
                      <h3>{e.title}</h3>
                      {e.synopsis && <p>{e.synopsis}</p>}
                      {e.runtime && <p>{e.runtime}</p>}
                      <span className="episode-state">
                        {watched ? (
                          <>
                            <Check size={12} /> Watched
                          </>
                        ) : p ? (
                          `${Math.ceil((p.duration - p.position) / 60)} min left`
                        ) : selected ? (
                          "Selected episode"
                        ) : (
                          ""
                        )}
                      </span>
                    </div>
                    <button
                      className="episode-action"
                      aria-label={`${source.status === "ready" ? "Play" : "Select"} episode ${e.number}`}
                      disabled={busy}
                      onClick={() => {
                        setEpisode(e.number);
                        if (source.status === "ready") void play(e.number);
                      }}
                    >
                      {source.status === "ready" ? (
                        <Play size={19} fill="currentColor" />
                      ) : (
                        <ChevronRight size={19} />
                      )}
                    </button>
                  </article>
                );
              })}
            </div>
            {!data.episodes.length && (
              <div className="empty compact">
                <p>No episodes are listed for this season.</p>
              </div>
            )}
          </section>
        )}
        <Row
          kicker="YOUR NEXT GOOD FIND"
          title="You may also like"
          items={data.related}
          href={t.kind === "series" ? "/series" : "/movies"}
        />
        <Link href="/my-list" className="text-button">
          Make room in your list <ArrowUpRight size={16} />
        </Link>
      </div>
    </>
  );
}
