"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Move } from "lucide-react";
import { api, type Episode, type Playback, type Title } from "@/lib/model";
import { titleHref } from "@/lib/curation";
const Player = dynamic(() => import("./player").then((m) => m.Player), {
  ssr: false,
  loading: () => <div className="player player-loading">Loading player…</div>,
});
export type PlaybackSession = {
  title: Title;
  source: Playback;
  season?: number;
  episode?: number;
  episodes: Episode[];
};
type Context = {
  session: PlaybackSession | null;
  open: (s: PlaybackSession) => void;
  close: () => void;
  minimize: () => void;
  register: (element: HTMLDivElement | null) => void;
  theater: boolean;
  minimized: boolean;
  error: string;
};
const PlaybackContext = createContext<Context | null>(null);
export function usePlayback() {
  const c = useContext(PlaybackContext);
  if (!c) throw new Error("Playback provider missing");
  return c;
}
export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<PlaybackSession | null>(null);
  const [mini, setMini] = useState(false);
  const [theater, setTheater] = useState(false);
  const [error, setError] = useState("");
  const [rect, setRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const anchor = useRef<HTMLDivElement | null>(null);
  const request = useRef(0);
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const routeMatches =
    !!session &&
    pathname.replace(/\/$/, "") === titleHref(session.title).replace(/\/$/, "");
  const minimized = mini || !routeMatches;
  const register = useCallback((el: HTMLDivElement | null) => {
    anchor.current = el;
  }, []);
  const open = useCallback((s: PlaybackSession) => {
    request.current++;
    setSession(s);
    setMini(false);
    setError("");
  }, []);
  const close = useCallback(() => {
    request.current++;
    setSession(null);
    setError("");
    setMini(false);
    setTheater(false);
  }, []);
  const minimize = useCallback(() => {
    setMini(true);
    setTheater(false);
  }, []);
  useEffect(() => {
    if (!session || minimized) return;
    const sync = () => {
      if (!anchor.current) return;
      const r = anchor.current.getBoundingClientRect();
      setRect({
        top: r.top + window.scrollY,
        left: r.left + window.scrollX,
        width: r.width,
        height: r.height,
      });
    };
    sync();
    const observer = new ResizeObserver(sync);
    if (anchor.current) observer.observe(anchor.current);
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync);
    };
  }, [session, minimized, theater, pathname]);
  async function resolve(ep?: number) {
    if (!session) return;
    const version = ++request.current;
    setError("");
    const p = new URLSearchParams({
      id: session.title.id,
      season: String(session.season || 1),
      episode: String(ep || session.episode || 1),
    });
    try {
      const r = await fetch(api("/playback?" + p));
      if (!r.ok) throw new Error();
      const source: Playback = await r.json();
      if (version !== request.current) return;
      if (source.status !== "ready" || !source.url) {
        setError(source.message || "This episode is unavailable.");
        return;
      }
      setSession((s) => (s ? { ...s, source, episode: ep || s.episode } : s));
    } catch {
      if (version === request.current)
        setError("Playback could not reconnect. Please try again.");
    }
  }
  const expand = () => {
    setMini(false);
    setPosition(null);
    if (session && !routeMatches)
      router.push(titleHref(session.title));
    else
      anchor.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const next = session?.episodes.find((e) => e.number > (session.episode || 0));
  const previous = session?.episodes
    .filter((e) => e.number < (session.episode || 0))
    .at(-1);
  const context = useMemo(
    () => ({
      session,
      open,
      close,
      minimize,
      register,
      theater,
      minimized,
      error,
    }),
    [session, open, close, minimize, register, theater, minimized, error],
  );
  return (
    <PlaybackContext.Provider value={context}>
      {children}
      {session && (
        <div
          className={
            minimized
              ? "player-host mini-player-host"
              : "player-host inline-player-host"
          }
          style={
            minimized
              ? position
                ? {
                    left: position.x,
                    top: position.y,
                    right: "auto",
                    bottom: "auto",
                  }
                : undefined
              : {
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  height: rect.height,
                  visibility: rect.width ? "visible" : "hidden",
                }
          }
        >
          {minimized && (
            <div
              className="mini-drag"
              onPointerDown={(e) => {
                if (e.pointerType !== "mouse") return;
                const r =
                  e.currentTarget.parentElement!.getBoundingClientRect();
                drag.current = {
                  x: e.clientX,
                  y: e.clientY,
                  left: r.left,
                  top: r.top,
                };
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (!drag.current) return;
                const d = drag.current;
                setPosition({
                  x: Math.max(
                    8,
                    Math.min(innerWidth - 360, d.left + e.clientX - d.x),
                  ),
                  y: Math.max(
                    80,
                    Math.min(innerHeight - 240, d.top + e.clientY - d.y),
                  ),
                });
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
            >
              <Move size={12} /> NOW PLAYING
            </div>
          )}
          <Player
            source={session.source}
            title={session.title}
            season={session.season}
            episode={session.episode}
            episodeTitle={
              session.episodes.find((e) => e.number === session.episode)?.title
            }
            onClose={close}
            onRetry={() => void resolve()}
            onNext={next ? () => void resolve(next.number) : undefined}
            onPrevious={
              previous ? () => void resolve(previous.number) : undefined
            }
            onMinimize={minimize}
            mini={minimized}
            onExpand={expand}
            theater={theater}
            onTheater={() => setTheater((t) => !t)}
          />
          {error && (
            <p className="player-session-error" role="alert">
              {error}
              <button onClick={() => void resolve()}>Retry</button>
            </p>
          )}
        </div>
      )}
    </PlaybackContext.Provider>
  );
}
export function PlaybackSlot() {
  const { register, theater } = usePlayback();
  return (
    <div
      ref={register}
      className={`playback-slot ${theater ? "theater" : ""}`}
    />
  );
}
