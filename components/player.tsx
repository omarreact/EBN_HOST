"use client";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  LoaderCircle,
  X,
  SkipForward,
  Download,
  PictureInPicture2,
  Tv,
} from "lucide-react";
import { api, type Playback, type Title } from "@/lib/model";
import { resume, saveProgress } from "@/lib/storage";
import { formatTime, mediaError, clampSeek } from "@/lib/player";

// Native audio tracks are browser-specific; keep DOM mutations in an event helper.
function chooseNativeAudioTrack(element: HTMLVideoElement | null, selected: number) {
  const tracks = (element as (HTMLVideoElement & {
    audioTracks?: ArrayLike<{ enabled: boolean }>;
  }) | null)?.audioTracks;
  if (!tracks?.length) return;
  for (let i = 0; i < tracks.length; i++) {
    tracks[i].enabled = i === (selected < 0 ? 0 : selected);
  }
}
export function Player({
  source,
  title,
  season,
  episode,
  episodeTitle,
  onClose,
  onRetry,
  onNext,
}: {
  source: Playback;
  title: Title;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  onClose: () => void;
  onRetry: () => void;
  onNext?: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const engine = useRef<Hls | null>(null);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [full, setFull] = useState(false);
  const [quality, setQuality] = useState(-1);
  const [levels, setLevels] = useState<{ height: number; index: number }[]>([]);
  const [audio, setAudio] = useState(-1);
  const [audios, setAudios] = useState<{ name: string; index: number }[]>([]);
  const [subtitle, setSubtitle] = useState(-1);
  const [captions, setCaptions] = useState<{ name: string; index: number }[]>(
    [],
  );
  const [speed, setSpeed] = useState(1);
  const [ended, setEnded] = useState(false);
  const [orientationNote, setOrientationNote] = useState("");
  const [fit, setFit] = useState<"contain" | "cover" | "fill">("contain");
  const [touchIndicator, setTouchIndicator] = useState<{
    text: string;
    side: "left" | "right";
  } | null>(null);
  const lastTap = useRef<{ time: number; x: number }>({ time: 0, x: 0 });
  const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTouchTime = useRef(0);

  async function togglePiP() {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (video.current) {
        await video.current.requestPictureInPicture();
      }
    } catch {}
  }

  function cycleFit() {
    setFit((prev) =>
      prev === "contain" ? "cover" : prev === "cover" ? "fill" : "contain",
    );
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (e.changedTouches.length !== 1) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, select, input, a, label")) return;

    // Event timestamps share a clock with the synthetic click after a touch.
    const now = e.timeStamp;
    lastTouchTime.current = now;
    const touch = e.changedTouches[0];
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    const x = touch.clientX - rect.left;
    const isLeft = x < rect.width / 2;

    if (now - lastTap.current.time < 320) {
      if (singleTapTimer.current) {
        clearTimeout(singleTapTimer.current);
        singleTapTimer.current = null;
      }
      e.preventDefault();
      seek(isLeft ? -5 : 5);
      setTouchIndicator({
        text: isLeft ? "-5s" : "+5s",
        side: isLeft ? "left" : "right",
      });
      setTimeout(() => setTouchIndicator(null), 600);
      lastTap.current = { time: 0, x: 0 };
    } else {
      lastTap.current = { time: now, x };
      if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
      singleTapTimer.current = setTimeout(() => {
        if (!visible) {
          reveal();
        } else {
          void toggle();
        }
        singleTapTimer.current = null;
      }, 280);
    }
  }

  function reveal() {
    setVisible(true);
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => {
      if (
        video.current &&
        !video.current.paused &&
        !frame.current?.contains(document.activeElement)
      )
        setVisible(false);
    }, 3000);
  }
  function persist() {
    const v = video.current;
    if (v && Number.isFinite(v.duration) && v.currentTime > 0)
      saveProgress({
        title,
        position: v.currentTime,
        duration: v.duration,
        season,
        episode,
        updatedAt: Date.now(),
      });
  }
  /* A changed external video stream needs its loading/error UI reset alongside the
     media element. Playback events own subsequent updates. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const v = video.current;
    if (!v || !source.url) return;
    let failures = 0;
    let disposed = false;
    setBusy(true);
    setError("");
    setEnded(false);
    setTime(0);
    setDuration(0);
    setLevels([]);
    setAudios([]);
    setCaptions([]);
    setQuality(-1);
    setSubtitle(-1);
    setAudio(-1);
    const attempt = () =>
      v.play().catch(() => {
        if (!disposed) {
          setBusy(false);
          setPlaying(false);
        }
      });
    const metadata = () => {
      setDuration(v.duration);
      const entry = resume(title, season, episode);
      if (entry && entry.position > 5 && entry.position < v.duration - 10)
        v.currentTime = entry.position;
      setCaptions(
        Array.from(v.textTracks).map((t, i) => ({
          name: t.label || t.language || `Track ${i + 1}`,
          index: i,
        })),
      );
      const nativeAudioTracks = (v as unknown as { audioTracks?: { label?: string; language?: string }[] }).audioTracks;
      if (nativeAudioTracks && nativeAudioTracks.length > 1) {
        setAudios(
          Array.from(nativeAudioTracks).map((t, i) => ({
            name: t.label || t.language || (i === 0 ? "Hindi (Dubbed)" : i === 1 ? "English (Original)" : `Audio ${i + 1}`),
            index: i,
          })),
        );
      } else {
        const isDual =
          title.category?.toLowerCase().includes("dual") ||
          title.title?.toLowerCase().includes("dual") ||
          title.title?.toLowerCase().includes("hindi & english");
        if (isDual) {
          setAudios([
            { name: "Hindi (Dubbed)", index: 0 },
            { name: "English (Original)", index: 1 },
          ]);
        }
      }
      attempt();
    };
    const progress = () => {
      setTime(v.currentTime);
      if (Date.now() - lastSaved.current > 5000) {
        lastSaved.current = Date.now();
        persist();
      }
    };
    const onPlay = () => {
      setPlaying(true);
      setEnded(false);
    };
    const onPause = () => {
      setPlaying(false);
      setVisible(true);
      persist();
    };
    const waiting = () => setBusy(true);
    const canplay = () => setBusy(false);
    const failed = () => {
      setBusy(false);
      setError(mediaError(v.error?.code));
    };
    const finish = () => {
      setEnded(true);
      setPlaying(false);
      persist();
    };
    const listeners: [string, EventListener][] = [
      ["loadedmetadata", metadata],
      ["timeupdate", progress],
      ["play", onPlay],
      ["pause", onPause],
      ["waiting", waiting],
      ["canplay", canplay],
      ["playing", canplay],
      ["error", failed],
      ["ended", finish],
    ];
    listeners.forEach(([event, fn]) => v.addEventListener(event, fn));
    if (
      source.format === "hls" &&
      !v.canPlayType("application/vnd.apple.mpegurl")
    ) {
      if (Hls.isSupported()) {
        const h = new Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          enableWorker: true,
          manifestLoadingMaxRetry: 2,
          levelLoadingMaxRetry: 2,
          fragLoadingMaxRetry: 2,
        });
        engine.current = h;
        h.attachMedia(v);
        h.loadSource(source.url);
        h.on(Hls.Events.MANIFEST_PARSED, () => {
          if (h.levels && h.levels.length > 0) {
            setLevels(h.levels.map((l, i) => ({ height: l.height || 1080, index: i })));
          }
          attempt();
        });
        h.on(Hls.Events.LEVEL_LOADED, () => {
          if (h.levels && h.levels.length > 0) {
            setLevels(h.levels.map((l, i) => ({ height: l.height || 1080, index: i })));
          }
        });
        h.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_, d) =>
          setAudios(
            d.audioTracks.map((t, i) => ({
              name: t.name || t.lang || `Audio ${i + 1}`,
              index: i,
            })),
          ),
        );
        h.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (_, d) =>
          setCaptions(
            d.subtitleTracks.map((t, i) => ({
              name: t.name || t.lang || `Captions ${i + 1}`,
              index: i,
            })),
          ),
        );
        h.on(Hls.Events.ERROR, (_, d) => {
          if (!d.fatal) return;
          if (failures++ < 2) {
            if (d.type === Hls.ErrorTypes.MEDIA_ERROR) h.recoverMediaError();
            else h.startLoad();
          } else {
            setBusy(false);
            setError(
              d.type === Hls.ErrorTypes.NETWORK_ERROR
                ? "The provider could not deliver this video. Check your connection and retry."
                : "This video could not be decoded.",
            );
            h.stopLoad();
          }
        });
      } else {
        setBusy(false);
        setError("Adaptive playback is unsupported in this browser.");
      }
    } else {
      v.src = source.url;
      v.load();
    }
    const onFullscreen = () => {
      setFull(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        try {
          screen.orientation.unlock();
        } catch {}
      }
    };
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      disposed = true;
      persist();
      listeners.forEach(([event, fn]) => v.removeEventListener(event, fn));
      document.removeEventListener("fullscreenchange", onFullscreen);
      engine.current?.destroy();
      engine.current = null;
      v.pause();
      v.removeAttribute("src");
      v.load();
      if (idle.current) clearTimeout(idle.current);
      try {
        screen.orientation.unlock();
      } catch {}
    };
    // Stream identity is stable until a fresh resolver response or episode change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source.url, title.id, season, episode]);
  /* eslint-enable react-hooks/set-state-in-effect */
  async function toggle() {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      try {
        await v.play();
      } catch {
        setError("Your browser could not start playback. Please retry.");
      }
    } else v.pause();
    reveal();
  }
  function seek(delta: number) {
    const v = video.current;
    if (v) v.currentTime = clampSeek(v.currentTime + delta, v.duration);
    reveal();
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      const f = frame.current;
      const v = video.current as
        (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
      if (f?.requestFullscreen) {
        await f.requestFullscreen();
        if (matchMedia("(max-width: 800px)").matches) {
          try {
            const orientation = screen.orientation as ScreenOrientation & {
              lock?: (mode: string) => Promise<void>;
            };
            await orientation.lock?.("landscape");
          } catch {
            setOrientationNote("Rotate your device for landscape viewing.");
          }
        }
      } else if (v?.webkitEnterFullscreen) {
        v.webkitEnterFullscreen();
      } else setOrientationNote("Fullscreen is unavailable in this browser.");
    } catch {
      setOrientationNote("Fullscreen is unavailable in this browser.");
    }
  }
  return (
    <div
      className={"player " + (!visible ? "controls-idle" : "")}
      ref={frame}
      tabIndex={0}
      aria-label={"Video player for " + title.title}
      onPointerMove={reveal}
      onPointerDown={reveal}
      onFocus={reveal}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        if (e.timeStamp - lastTouchTime.current < 450) return;
        const tag = (e.target as HTMLElement).tagName;
        if (["INPUT", "SELECT", "BUTTON", "A"].includes(tag)) return;
        if (!visible) {
          reveal();
        } else {
          void toggle();
        }
      }}
      onKeyDown={(e) => {
        const tag = (e.target as HTMLElement).tagName;
        if (["INPUT", "SELECT", "BUTTON"].includes(tag)) return;
        if (e.code === "Space") {
          e.preventDefault();
          void toggle();
        }
        if (e.key.toLowerCase() === "f") void fullscreen();
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          seek(-10);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          seek(10);
        }
        if (e.key.toLowerCase() === "m" && video.current) {
          video.current.muted = !video.current.muted;
          setVolume(video.current.muted ? 0 : video.current.volume);
        }
        if (e.key === "Escape" && document.fullscreenElement)
          void document.exitFullscreen();
      }}
    >
      <video
        ref={video}
        playsInline
        preload="metadata"
        crossOrigin={source.format === "hls" ? "anonymous" : undefined}
        aria-label={title.title}
        style={{ objectFit: fit }}
      >
        {source.subtitles?.map((t) => (
          <track
            key={t.url}
            kind="subtitles"
            src={t.url}
            label={t.label}
            srcLang={t.language}
          />
        ))}
      </video>
      {touchIndicator && (
        <div className={`touch-indicator ${touchIndicator.side}`}>
          {touchIndicator.text}
        </div>
      )}
      <div className="player-top">
        <span>
          {title.title}
          {episode ? ` · S${season} E${episode}` : ""}
          {episodeTitle ? ` · ${episodeTitle}` : ""}
        </span>
        <button
          className="icon-button"
          aria-label="Close player"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
      {busy && !error && (
        <div className="player-center">
          <LoaderCircle className="spin" size={34} />
          <span>Loading video…</span>
        </div>
      )}
      {!playing && !busy && !error && !ended && (
        <button
          className="center-play"
          aria-label="Play video"
          onClick={() => void toggle()}
        >
          <Play fill="currentColor" />
        </button>
      )}
      {error && (
        <div className="player-error" role="alert">
          <h3>We couldn’t play this video.</h3>
          <p>{error}</p>
          <button className="primary" onClick={onRetry}>
            <RotateCcw size={16} /> Retry
          </button>
        </div>
      )}
      {ended && (
        <div className="player-error">
          <h3>{onNext ? "Ready for the next chapter?" : "That’s a wrap."}</h3>
          <button
            className="primary"
            onClick={
              onNext ||
              (() => {
                if (video.current) video.current.currentTime = 0;
                void toggle();
              })
            }
          >
            {onNext ? "Next episode" : "Watch again"}
            <SkipForward size={18} />
          </button>
        </div>
      )}
      <div className="player-controls">
        <label className="seek">
          <span className="sr-only">Seek video</span>
          <input
            type="range"
            min="0"
            max={Number.isFinite(duration) ? duration : 0}
            step="0.1"
            value={Math.min(time, Number.isFinite(duration) ? duration : 0)}
            onChange={(e) => {
              if (video.current)
                video.current.currentTime = Number(e.target.value);
              setTime(Number(e.target.value));
            }}
          />
        </label>
        <div className="control-row">
          <button
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => void toggle()}
          >
            {playing ? (
              <Pause fill="currentColor" />
            ) : (
              <Play fill="currentColor" />
            )}
          </button>
          <button aria-label="Back 10 seconds" onClick={() => seek(-10)}>
            <RotateCcw size={19} />
          </button>
          <button aria-label="Forward 10 seconds" onClick={() => seek(10)}>
            <RotateCw size={19} />
          </button>
          <span className="time">
            {formatTime(time)} <i>/</i> {formatTime(duration)}
          </span>
          <div className="volume">
            <button
              aria-label={volume ? "Mute" : "Unmute"}
              onClick={() => {
                if (video.current) {
                  video.current.muted = !video.current.muted;
                  setVolume(
                    video.current.muted ? 0 : video.current.volume || 1,
                  );
                }
              }}
            >
              {volume ? <Volume2 size={19} /> : <VolumeX size={19} />}
            </button>
            <input
              aria-label="Volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                const n = Number(e.target.value);
                setVolume(n);
                if (video.current) {
                  video.current.volume = n;
                  video.current.muted = n === 0;
                }
              }}
            />
          </div>
          <div className="settings">
            <select
              aria-label="Playback speed"
              value={speed}
              onChange={(e) => {
                setSpeed(Number(e.target.value));
                if (video.current)
                  video.current.playbackRate = Number(e.target.value);
              }}
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((n) => (
                <option key={n} value={n}>
                  {n}×
                </option>
              ))}
            </select>
            <select
              aria-label="Video quality"
              value={quality}
              onChange={(e) => {
                const n = Number(e.target.value);
                setQuality(n);
                if (engine.current && levels.length > 0) {
                  engine.current.currentLevel = n;
                }
              }}
            >
              <option value={-1}>Auto</option>
              {levels.length > 0 ? (
                levels.map((l) => (
                  <option value={l.index} key={l.index}>
                    {l.height ? `${l.height}p` : `Quality ${l.index + 1}`}
                  </option>
                ))
              ) : (
                <>
                  <option value={1080}>1080p</option>
                  <option value={720}>720p</option>
                  <option value={480}>480p</option>
                  <option value={360}>360p</option>
                </>
              )}
            </select>
            {audios.length > 0 && (
              <select
                aria-label="Audio track"
                value={audio}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAudio(val);
                  if (engine.current) {
                    engine.current.audioTrack = val;
                  }
                  chooseNativeAudioTrack(video.current, val);
                }}
              >
                <option value={-1}>Audio: {audios[0]?.name || "Default"}</option>
                {audios.map((a) => (
                  <option key={a.index} value={a.index}>
                    {a.name}
                  </option>
                ))}
              </select>
            )}
            {captions.length > 0 && (
              <select
                aria-label="Subtitles"
                value={subtitle}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setSubtitle(n);
                  if (engine.current) {
                    engine.current.subtitleTrack = n;
                    engine.current.subtitleDisplay = n >= 0;
                  } else if (video.current)
                    Array.from(video.current.textTracks).forEach(
                      (t, i) => (t.mode = i === n ? "showing" : "disabled"),
                    );
                }}
              >
                <option value={-1}>CC off</option>
                {captions.map((c) => (
                  <option key={c.index} value={c.index}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <button
            type="button"
            aria-label="Picture-in-picture"
            title="Picture-in-picture"
            onClick={() => void togglePiP()}
          >
            <PictureInPicture2 size={19} />
          </button>
          <button
            type="button"
            aria-label={`Aspect ratio: ${fit}`}
            title={`Fit: ${fit}`}
            onClick={cycleFit}
          >
            <Tv size={19} />
          </button>
          <a
            className="icon-button"
            aria-label="Download video"
            title="Download video"
            href={api(
              `/download?id=${title.id}${season ? `&season=${season}` : ""}${episode ? `&episode=${episode}` : ""}`,
            )}
            download
          >
            <Download size={19} />
          </a>
          <button
            aria-label={full ? "Exit fullscreen" : "Enter fullscreen"}
            onClick={() => void fullscreen()}
          >
            {full ? <Minimize size={21} /> : <Maximize size={21} />}
          </button>
        </div>
        {orientationNote && (
          <p className="orientation-note">{orientationNote}</p>
        )}
      </div>
    </div>
  );
}
