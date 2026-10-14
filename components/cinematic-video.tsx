"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Artwork, artworkUrl } from "./artwork";

export function CinematicVideo({
  url,
  poster,
  active = true,
  label = "Background video",
}: {
  url?: string;
  poster: string | null;
  active?: boolean;
  label?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const region = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () =>
      setAllowed(
        !media.matches && document.documentElement.dataset.motion !== "off",
      );
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("pinflix-preferences", sync);
    const observer = new IntersectionObserver(
      (entries) => setInView(entries[0].isIntersecting),
      { threshold: 0.25 },
    );
    if (region.current) observer.observe(region.current);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", sync);
      window.removeEventListener("pinflix-preferences", sync);
    };
  }, []);
  const enabled = !!url && active && inView && allowed && !failed;
  useEffect(() => {
    const v = video.current;
    const sync = () => {
      if (enabled && !paused && !document.hidden)
        v?.play().catch(() => setPaused(true));
      else v?.pause();
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [enabled, paused]);
  return (
    <div className="cinematic-media" ref={region}>
      <Artwork src={poster} alt="" />
      {url && allowed && !failed && (
        <video
          ref={video}
          src={enabled ? url : undefined}
          poster={artworkUrl(poster) || undefined}
          loop
          muted={muted}
          playsInline
          preload="none"
          aria-label={label}
          onError={() => setFailed(true)}
        />
      )}
      {enabled && (
        <div className="ambient-controls">
          <button
            className="icon-button"
            aria-label={paused ? `Play ${label}` : `Pause ${label}`}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          <button
            className="icon-button"
            aria-label={muted ? `Unmute ${label}` : `Mute ${label}`}
            onClick={() => setMuted((m) => !m)}
          >
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
        </div>
      )}
    </div>
  );
}
