"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  LoaderCircle,
  Check,
  ChevronRight,
  Download,
} from "lucide-react";
import { api, type Detail, type Playback } from "@/lib/model";
import { Artwork } from "./artwork";
import { SaveButton, useAccent } from "./hero";
import dynamic from "next/dynamic";
const Player = dynamic(() => import("./player").then((m) => m.Player), {
  ssr: false,
  loading: () => (
    <div className="player">
      <div className="player-center">Loading player…</div>
    </div>
  ),
});
import { Row } from "./cards";
import { history } from "@/lib/storage";
export function DetailView({
  initial,
  initialPlayback,
}: {
  initial: Detail;
  initialPlayback: Playback;
}) {
  const [data, setData] = useState(initial);
  const [season, setSeason] = useState(initial.season);
  const [episode, setEpisode] = useState(initial.episodes[0]?.number || 1);
  const [source, setSource] = useState<Playback | null>(initialPlayback);
  const [started, setStarted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(
    initialPlayback.status === "ready" ? "" : initialPlayback.message,
  );
  const [watched, setWatched] = useState<string[]>([]);
  const [gate, setGate] = useState(!initial.title.mature);
  const accent = useAccent(data.title.poster);
  // Hydrate device-local progress after SSR; no provider requests depend on it.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const entries = history().filter((e) => e.title.id === initial.title.id);
    setWatched(
      entries
        .filter((e) => e.duration && e.position / e.duration > 0.95)
        .map((e) => `${e.season}:${e.episode}`),
    );
    const last = entries[0];
    if (
      last &&
      initial.title.kind === "series" &&
      last.season === initial.season &&
      initial.episodes.some((e) => e.number === last.episode)
    )
      setEpisode(last.episode!);
  }, [initial]);
  /* eslint-enable react-hooks/set-state-in-effect */
  async function play(ep = episode) {
    setEpisode(ep);
    setBusy(true);
    setNote("");
    setStarted(false);
    try {
      const r = await fetch(
        api(
          "/playback?" +
            new URLSearchParams({
              id: data.title.id,
              season: String(season),
              episode: String(ep),
            }),
        ),
      );
      if (!r.ok) throw new Error();
      const p: Playback = await r.json();
      setSource(p);
      if (p.status === "ready") setStarted(true);
      else setNote(p.message);
    } catch {
      setNote("Playback is temporarily unavailable. Please try again later.");
    } finally {
      setBusy(false);
    }
  }
  async function changeSeason(n: number) {
    setSeason(n);
    setStarted(false);
    setSource(null);
    setBusy(true);
    setNote("");
    try {
      const r = await fetch(
        api(
          "/detail?" +
            new URLSearchParams({ id: data.title.id, season: String(n) }),
        ),
      );
      if (!r.ok) throw new Error();
      const next: Detail = await r.json();
      setData(next);
      setEpisode(next.episodes[0]?.number || 1);
    } catch {
      setNote("This season could not be loaded. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const next = data.episodes.find((e) => e.number > episode);
  const t = data.title;
  if (!gate)
    return (
      <div className="empty error-page">
        <h1>Mature content</h1>
        <p>
          This title is intended for adults. Continue only if you meet your
          local age requirement.
        </p>
        <button className="primary" onClick={() => setGate(true)}>
          I meet the age requirement
        </button>
        <Link href="/">Go back</Link>
      </div>
    );
  return (
    <>
      <div className="detail-heading">
        <Link href={t.kind === "series" ? "/series" : "/movies"}>
          <ArrowLeft size={17} /> Back to{" "}
          {t.kind === "series" ? "series" : "movies"}
        </Link>
        <span>
          {t.kind === "series" ? "THE NEXT CHAPTER" : "BEHIND THE STORY"}
        </span>
      </div>
      <section
        className="detail-hero"
        style={{ "--accent": accent } as React.CSSProperties}
      >
        {started && source ? (
          <Player
            source={source}
            title={t}
            season={t.kind === "series" ? season : undefined}
            episode={t.kind === "series" ? episode : undefined}
            episodeTitle={
              t.kind === "series"
                ? data.episodes.find((e) => e.number === episode)?.title
                : undefined
            }
            onClose={() => setStarted(false)}
            onRetry={() => void play()}
            onNext={next ? () => void play(next.number) : undefined}
          />
        ) : (
          <>
            <div className="detail-art">
              <Artwork src={t.backdrop || t.poster} alt="" priority />
            </div>
            <div className="hero-shade" />
            <div className="detail-copy">
              <p className="eyebrow">
                {t.category ||
                  (t.kind === "series" ? "SERIES" : "FEATURE FILM")}
              </p>
              <h1>{t.title}</h1>
              <div className="detail-meta">
                {[
                  t.year,
                  t.runtime,
                  t.quality,
                  t.rating ? "★ " + t.rating : null,
                  t.mature ? "18+" : null,
                ]
                  .filter(Boolean)
                  .map((v, i) => (
                    <span key={i}>{v}</span>
                  ))}
              </div>
              <p className="hero-synopsis">
                {t.synopsis ||
                  "More information about this story is currently unavailable."}
              </p>
              <div className="actions">
                <button
                  className="primary"
                  onClick={() => void play()}
                  disabled={busy || source?.status === "authorization_required"}
                >
                  {busy ? (
                    <LoaderCircle className="spin" size={18} />
                  ) : (
                    <Play fill="currentColor" size={18} />
                  )}{" "}
                  {source?.status !== "ready"
                    ? "Playback unavailable"
                    : t.kind === "series"
                      ? `Play S${season} · E${episode}`
                      : "Play movie"}
                </button>
                <a
                  className="secondary button-download"
                  href={api(
                    `/download?id=${t.id}${t.kind === "series" ? `&season=${season}&episode=${episode}` : ""}`,
                  )}
                  download
                  title={
                    t.kind === "series"
                      ? `Download S${season} E${episode}`
                      : "Download movie"
                  }
                >
                  <Download size={18} /> Download
                </a>
                <SaveButton title={t} />
              </div>
              {note && (
                <p className="playback-note" role="status">
                  {note}
                </p>
              )}
            </div>
          </>
        )}
      </section>
      <div className="page-content">
        <div className="detail-info">
          <div>
            <p className="eyebrow">THE STORY</p>
            <h2>
              {t.kind === "series"
                ? "A world to return to."
                : "Take a closer look."}
            </h2>
            <p>{t.synopsis || "No synopsis is available for this title."}</p>
          </div>
          <dl>
            {t.genres.length > 0 && (
              <>
                <dt>Genres</dt>
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
                <dt>Collection language</dt>
                <dd>{t.language}</dd>
              </>
            )}
            <dt>Year</dt>
            <dd>{t.year || "Unavailable"}</dd>
          </dl>
        </div>
        {t.kind === "series" && (
          <section className="section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">THE NEXT CHAPTER</p>
                <h2>Episodes</h2>
              </div>
              <label className="season-select">
                Season{" "}
                <select
                  aria-label="Select season"
                  value={season}
                  onChange={(e) => void changeSeason(Number(e.target.value))}
                >
                  {(t.seasons.length ? t.seasons : [season]).map((n) => (
                    <option value={n} key={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="episodes">
              {data.episodes.map((e) => (
                <div
                  key={e.number}
                  className={
                    "episode " + (episode === e.number ? "active" : "")
                  }
                >
                  <button
                    type="button"
                    className="episode-btn"
                    disabled={
                      busy || source?.status === "authorization_required"
                    }
                    onClick={() => {
                      setEpisode(e.number);
                      void play(e.number);
                      document
                        .querySelector(".detail-hero")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                    }}
                  >
                    <div className="episode-art">
                      <Artwork src={e.thumbnail || t.poster} alt={e.title} />
                      <span>
                        <Play fill="currentColor" size={20} />
                      </span>
                    </div>
                    <div className="episode-copy">
                      <small>
                        EPISODE {String(e.number).padStart(2, "0")}
                        {e.quality ? " · " + e.quality : ""}
                      </small>
                      <h3>{e.title}</h3>
                    </div>
                    {watched.includes(`${season}:${e.number}`) ? (
                      <Check size={19} aria-label="Watched" />
                    ) : (
                      <ChevronRight size={19} />
                    )}
                  </button>
                  <a
                    className="episode-download"
                    href={api(
                      `/download?id=${t.id}&season=${season}&episode=${e.number}`,
                    )}
                    download
                    title={`Download S${season} E${e.number}`}
                    aria-label={`Download S${season} E${e.number}`}
                    onClick={(ev) => ev.stopPropagation()}
                  >
                    <Download size={18} />
                  </a>
                </div>
              ))}
            </div>
            {!data.episodes.length && (
              <div className="empty">
                <p>No episodes are available in this season.</p>
              </div>
            )}
          </section>
        )}
        <Row
          kicker="KEEP EXPLORING"
          title="More stories for you"
          items={data.related}
          href={t.kind === "series" ? "/series" : "/movies"}
        />
      </div>
    </>
  );
}
