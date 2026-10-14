"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bookmark, Clock, LogOut, Trash2 } from "lucide-react";
import { useAccount } from "./account-context";
import { defaultPreferences, type Preferences } from "@/lib/preferences";
import { saved, history, write } from "@/lib/storage";
import { CloudSyncBanner } from "./library-sync";
export function Profile() {
  const { user, preferences, updatePreferences, logout, refresh } =
    useAccount();
  const [draft, setDraft] = useState<Preferences | null>(null);
  const form = draft || {
    ...preferences,
    name: user?.name || preferences.name,
  };
  const [count, setCount] = useState({ saved: 0, watching: 0 });
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    const sync = () =>
      setCount({
        saved: saved().length,
        watching: history().filter(
          (e) =>
            e.duration > 0 && e.position > 5 && e.position / e.duration < 0.95,
        ).length,
      });
    sync();
    window.addEventListener("pinflix-storage", sync);
    return () => window.removeEventListener("pinflix-storage", sync);
  }, []);
  const set = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setDraft((p) => ({ ...(p || form), [key]: value }));
  async function save() {
    setBusy(true);
    setNote("");
    try {
      if (user && form.name !== user.name) {
        const r = await fetch("/api/account/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "profile", name: form.name }),
        });
        if (!r.ok) throw new Error("Your account name could not be saved.");
        await refresh();
      }
      updatePreferences(form);
      setNote("Your preferences are saved.");
    } catch (e) {
      setNote(
        e instanceof Error ? e.message : "Your preferences could not be saved.",
      );
    } finally {
      setBusy(false);
    }
  }
  const toggle = (
    key: "autoplay" | "motion" | "captions",
    label: string,
    description: string,
  ) => (
    <label className="toggle-row">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={form[key]}
        aria-label={label}
        onChange={(e) => set(key, e.target.checked)}
      />
    </label>
  );
  return (
    <div className="page-content account-page">
      <div className="account-heading">
        <div className={`avatar profile-avatar avatar-${form.avatar}`}>
          {form.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="eyebrow">YOUR PINFLIX</p>
          <h1>{user ? "Your profile." : "Make it yours."}</h1>
          <p>{user ? user.email : "A local profile for your movie nights."}</p>
        </div>
      </div>
      <div className="profile-layout">
        <div>
          <section className="settings-card">
            <h2>Profile details</h2>
            <p>A little personality for your personal cinema.</p>
            <label>
              Your name
              <input
                aria-label="Profile name"
                value={form.name}
                maxLength={40}
                onChange={(e) => set("name", e.target.value)}
              />
            </label>
            <span className="small-label">YOUR COLOUR</span>
            <div className="avatar-options">
              {(["silver", "violet", "blue", "amber"] as const).map((c) => (
                <button
                  key={c}
                  aria-label={`${c} profile colour`}
                  aria-pressed={form.avatar === c}
                  className={`avatar avatar-${c}`}
                  onClick={() => set("avatar", c)}
                >
                  {form.name.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>
          </section>
          <section className="settings-card">
            <h2>The way you watch</h2>
            <p>
              Your preferences apply to this browser and can sync with your
              account.
            </p>
            {toggle(
              "autoplay",
              "Autoplay next episode",
              "Continue into the next episode when it’s available.",
            )}
            {toggle(
              "motion",
              "Cinematic motion",
              "Ambient videos and carousel transitions. Device motion preferences still apply.",
            )}
            {toggle(
              "captions",
              "Prefer captions",
              "Enable a supplied caption track when one is available.",
            )}
            <label>
              Playback quality
              <select
                aria-label="Preferred playback quality"
                value={form.quality}
                onChange={(e) =>
                  set("quality", e.target.value as Preferences["quality"])
                }
              >
                <option value="auto">Automatic · match my connection</option>
                <option value="high">Highest available</option>
                <option value="data-saver">
                  Data saver · up to 480p where available
                </option>
              </select>
            </label>
            <div className="settings-actions">
              <button
                className="primary"
                disabled={busy || !form.name.trim()}
                onClick={() => void save()}
              >
                Save preferences
              </button>
              <button
                className="secondary"
                onClick={() => {
                  setDraft(defaultPreferences);
                  setNote("");
                }}
              >
                Restore defaults
              </button>
            </div>
            {note && (
              <p role="status" className="profile-note">
                {note}
              </p>
            )}
          </section>
        </div>
        <div>
          <section className="settings-card">
            <h2>Your collection</h2>
            <p>The stories you keep close.</p>
            <div className="profile-stats">
              <div>
                <Bookmark size={16} />
                <strong>{count.saved}</strong>
                <span>Saved stories</span>
              </div>
              <div>
                <Clock size={16} />
                <strong>{count.watching}</strong>
                <span>In progress</span>
              </div>
            </div>
            <Link
              href="/my-list"
              className="text-button"
              style={{ marginTop: 22 }}
            >
              Open My List <ArrowUpRight size={14} />
            </Link>
          </section>
          <section className="settings-card">
            <h2>{user ? "Your account" : "Take your stories with you"}</h2>
            <p>
              {user
                ? "Sign out on shared devices when you’re done."
                : "Your list and progress are saved locally. Sign in to connect an account library."}
            </p>
            {user ? (
              <button className="secondary" onClick={() => void logout()}>
                <LogOut size={15} /> Sign out
              </button>
            ) : (
              <Link className="secondary" href="/login?next=/profile">
                Sign in <ArrowUpRight size={15} />
              </Link>
            )}
          </section>
          <CloudSyncBanner />
          <section className="settings-card">
            <h2>A fresh start</h2>
            <p>
              Clear saved titles and watch history on this device. Connected
              sync will receive these changes.
            </p>
            <button
              className="text-button text-danger"
              onClick={() => setConfirm(true)}
            >
              <Trash2 size={14} /> Clear this device’s library
            </button>
            {confirm && (
              <div className="confirm-inline">
                <p>Remove saved titles and all playback progress?</p>
                <div className="settings-actions">
                  <button
                    className="primary"
                    onClick={() => {
                      write("list", []);
                      write("history", []);
                      setConfirm(false);
                      setNote("Your device library is now clear.");
                    }}
                  >
                    Clear library
                  </button>
                  <button
                    className="secondary"
                    onClick={() => setConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
