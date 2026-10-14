"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useAccount } from "./account-context";
import { Artwork } from "./artwork";
export function Login({ next }: { next: string }) {
  const { configured, user, refresh } = useAccount();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNote("");
    const fields = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/account/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          email: fields.get("email"),
          ...(mode !== "reset" ? { password: fields.get("password") } : {}),
          ...(mode === "signup" ? { name: fields.get("name") } : {}),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      if (mode === "reset") setNote(d.message);
      else {
        await refresh();
        router.push(next);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Sign-in could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  }
  function change(mode: "signin" | "signup" | "reset") {
    setMode(mode);
    setError("");
    setNote("");
  }
  return (
    <div className="login-page">
      <div className="login-art">
        <Artwork
          src="https://image.tmdb.org/t/p/w500/c8huM0hQ5fCjGFDyUmpQW9x0xmR.jpg"
          alt=""
        />
        <div className="login-art-shade" />
        <div className="login-intro">
          <p className="eyebrow">YOUR NEXT STORY STARTS HERE</p>
          <h2>
            Good stories.
            <br />
            Great escapes.
            <br />
            <em>Your place.</em>
          </h2>
          <p>Save a story. Pick up where you left off. Make it yours.</p>
        </div>
      </div>
      <div className="login-panel">
        <p className="eyebrow">WELCOME TO PINFLIX</p>
        <h1>
          {user
            ? "You’re right at home."
            : mode === "signup"
              ? "Make yourself at home."
              : mode === "reset"
                ? "Let’s get you back in."
                : "Welcome back."}
        </h1>
        <p>
          {user
            ? `Signed in as ${user.email}.`
            : mode === "signup"
              ? "Create your personal home for the stories you love."
              : mode === "reset"
                ? "Enter your email and we’ll help you reset your password."
                : "Sign in to bring your favourite stories with you."}
        </p>
        {user ? (
          <Link className="primary" href={next}>
            Open your library <ArrowUpRight size={16} />
          </Link>
        ) : (
          <>
            {!configured && (
              <div className="notice" role="status">
                Sign-in is currently unavailable. Your watchlist and progress
                work with a local profile.
              </div>
            )}
            <form onSubmit={submit}>
              {mode === "signup" && (
                <label>
                  Your name
                  <input
                    name="name"
                    autoComplete="name"
                    placeholder="How should we call you?"
                    minLength={1}
                    maxLength={40}
                    required
                  />
                </label>
              )}
              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  maxLength={254}
                />
              </label>
              {mode !== "reset" && (
                <label>
                  Password
                  <span className="password-field">
                    <input
                      type={visible ? "text" : "password"}
                      name="password"
                      autoComplete={
                        mode === "signup" ? "new-password" : "current-password"
                      }
                      minLength={mode === "signup" ? 8 : 1}
                      maxLength={128}
                      required
                      placeholder={
                        mode === "signup"
                          ? "At least 8 characters"
                          : "Your password"
                      }
                    />
                    <button
                      type="button"
                      aria-label={visible ? "Hide password" : "Show password"}
                      onClick={() => setVisible((v) => !v)}
                    >
                      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </span>
                </label>
              )}
              {error && (
                <p className="text-danger" role="alert">
                  {error}
                </p>
              )}
              {note && <p role="status">{note}</p>}
              <button className="primary" disabled={busy || !configured}>
                {busy ? (
                  <LoaderCircle size={17} className="spin" />
                ) : (
                  <ArrowUpRight size={17} />
                )}{" "}
                {mode === "signup"
                  ? "Create account"
                  : mode === "reset"
                    ? "Send reset email"
                    : "Sign in"}
              </button>
            </form>
            <div className="login-secondary-actions">
              <button
                onClick={() => change(mode === "signup" ? "signin" : "signup")}
              >
                {mode === "signup"
                  ? "Already have an account? Sign in"
                  : "New here? Create an account"}
              </button>
              <button
                onClick={() => change(mode === "reset" ? "signin" : "reset")}
              >
                {mode === "reset" ? "Back to sign in" : "Forgot password?"}
              </button>
            </div>
          </>
        )}
        <Link href="/profile" className="guest-link">
          Continue with a local profile <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}
