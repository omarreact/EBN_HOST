"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Cloud, CloudOff, LoaderCircle } from "lucide-react";
import { useAccount } from "./account-context";
import { saved, history, write } from "@/lib/storage";
import {
  LibrarySchema,
  mergeLibraries,
  type LibraryData,
} from "@/lib/library-model";
type Context = {
  pending: boolean;
  ready: boolean;
  busy: boolean;
  error: string;
  lastSynced: number;
  connect: () => Promise<void>;
  choose: (merge: boolean) => void;
  disconnect: () => void;
};
const SyncContext = createContext<Context | null>(null);
function localData(preferences: LibraryData["preferences"]): LibraryData {
  return { list: saved(), history: history(), preferences };
}
export function LibrarySyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, preferences, updatePreferences } = useAccount();
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [lastSynced, setLastSynced] = useState(0);
  const cloud = useRef<LibraryData | null>(null);
  const revision = useRef<string | null>(null);
  const pref = useRef(preferences);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0);
  const apply = useRef(updatePreferences);
  const syncing = useRef(false);
  const dirty = useRef(0);
  useEffect(() => {
    pref.current = preferences;
    apply.current = updatePreferences;
  }, [preferences, updatePreferences]);
  const connect = useCallback(async () => {
    if (!user?.uid) return;
    const version = ++generation.current;
    setBusy(true);
    setError("");
    setReady(false);
    try {
      const r = await fetch("/api/library/", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      if (version !== generation.current) return;
      cloud.current = LibrarySchema.parse(d.data);
      revision.current = d.revision;
      setPending(true);
    } catch (e) {
      if (version === generation.current)
        setError(
          e instanceof Error
            ? e.message
            : "Your cloud library could not connect.",
        );
    } finally {
      if (version === generation.current) setBusy(false);
    }
  }, [user?.uid]);
  useEffect(() => {
    const state = generation;
    const task = setTimeout(() => {
      if (user?.uid) void connect();
    }, 0);
    return () => {
      clearTimeout(task);
      state.current++;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [user?.uid, connect]);
  function choose(merge: boolean) {
    if (!cloud.current) return;
    const data = merge
      ? mergeLibraries(localData(pref.current), cloud.current)
      : cloud.current;
    write("list", data.list);
    write("history", data.history);
    apply.current(data.preferences);
    setPending(false);
    setReady(true);
    dirty.current++;
  }
  const disconnect = () => {
    generation.current++;
    setReady(false);
    setPending(false);
    setError("");
    if (timer.current) clearTimeout(timer.current);
  };
  useEffect(() => {
    if (!ready || !user?.uid) return;
    const ownerGeneration = generation.current;
    async function save() {
      if (syncing.current) return;
      syncing.current = true;
      const current = dirty.current;
      setBusy(true);
      try {
        const r = await fetch("/api/library/", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: localData(pref.current),
            revision: revision.current,
          }),
        });
        const d = await r.json();
        if (ownerGeneration !== generation.current) return;
        if (!r.ok) throw new Error(d.error);
        revision.current = d.revision;
        setLastSynced(Date.now());
        setError("");
        if (dirty.current !== current)
          timer.current = setTimeout(() => void save(), 15000);
      } catch (e) {
        if (ownerGeneration === generation.current) {
          setError(
            e instanceof Error
              ? e.message
              : "Your cloud library could not sync.",
          );
          setReady(false);
        }
      } finally {
        syncing.current = false;
        if (ownerGeneration === generation.current) setBusy(false);
      }
    }
    const queue = () => {
      dirty.current++;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void save(), 15000);
    };
    void save();
    window.addEventListener("pinflix-storage", queue);
    return () => {
      window.removeEventListener("pinflix-storage", queue);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [ready, user?.uid]);
  return (
    <SyncContext.Provider
      value={{
        pending,
        ready,
        busy,
        error,
        lastSynced,
        connect,
        choose,
        disconnect,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}
export function CloudSyncBanner() {
  const { user } = useAccount();
  const sync = useContext(SyncContext);
  if (!sync || !user) return null;
  return (
    <div className="settings-card sync-banner">
      <h2>
        <Cloud size={19} /> Your cloud library
      </h2>
      {sync.pending ? (
        <>
          <p>
            Choose how to bring this device and your account together. Merging
            keeps saved titles and the most recent progress for each episode.
          </p>
          <div className="sync-choice">
            <button className="primary" onClick={() => sync.choose(true)}>
              Merge libraries
            </button>
            <button className="secondary" onClick={() => sync.choose(false)}>
              Use account library
            </button>
            <button className="text-button" onClick={sync.disconnect}>
              Keep this device local
            </button>
          </div>
        </>
      ) : (
        <>
          <p>
            {sync.ready
              ? sync.busy
                ? "Saving your latest stories…"
                : `Sync is connected${sync.lastSynced ? " · last saved at " + new Date(sync.lastSynced).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}.`
              : "Your library is stored on this device. Connect to bring your account’s saved stories here."}
          </p>
          {sync.error && (
            <p className="text-danger" role="alert">
              {sync.error}
            </p>
          )}
          <button
            className="secondary"
            disabled={sync.busy}
            onClick={() => {
              if (sync.ready) sync.disconnect();
              else void sync.connect();
            }}
          >
            {sync.busy ? (
              <LoaderCircle size={15} className="spin" />
            ) : sync.ready ? (
              <CloudOff size={15} />
            ) : (
              <Cloud size={15} />
            )}{" "}
            {sync.ready ? "Disconnect sync" : "Connect library"}
          </button>
        </>
      )}
    </div>
  );
}
