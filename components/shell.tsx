"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X, ArrowUpRight, Menu, Play, ChevronDown } from "lucide-react";
import { api, type Title } from "@/lib/model";
import { Artwork } from "./artwork";
import { read, write } from "@/lib/storage";
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Title[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);
  function openSearch() {
    const r = read<unknown>("search", []);
    setRecent(
      Array.isArray(r)
        ? r.filter((x): x is string => typeof x === "string").slice(0, 8)
        : [],
    );
    setOpen(true);
  }
  useEffect(() => {
    if (q.trim().length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(api("/suggest?q=" + encodeURIComponent(q)), {
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((d) => {
          setItems(d.items || []);
          setActive(-1);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);
  function search(value = q) {
    if (!value.trim()) return;
    write(
      "search",
      [value.trim(), ...recent.filter((x) => x !== value.trim())].slice(0, 8),
    );
    setOpen(false);
    router.push("/search?q=" + encodeURIComponent(value));
  }
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="header">
        <Link href="/" className="brand" aria-label="PinFlix home">
          <span className="brand-mark">
            <Play size={15} fill="currentColor" />
          </span>
          pin<span>flix</span>
          <i />
        </Link>
        <nav
          aria-label="Main navigation"
          className={menu ? "nav-links mobile-open" : "nav-links"}
        >
          <Link
            href="/"
            onClick={() => { setMenu(false); setCatOpen(false); }}
            className={pathname === "/" ? "active" : ""}
          >
            Discover
          </Link>
          <Link
            href="/movies"
            onClick={() => { setMenu(false); setCatOpen(false); }}
            className={pathname === "/movies" ? "active" : ""}
          >
            Movies
          </Link>
          <Link
            href="/series"
            onClick={() => { setMenu(false); setCatOpen(false); }}
            className={pathname === "/series" ? "active" : ""}
          >
            Series
          </Link>
          <div className="nav-item-dropdown">
            <button
              type="button"
              className="nav-dropdown-trigger"
              onClick={() => setCatOpen(!catOpen)}
              aria-expanded={catOpen}
            >
              Categories <ChevronDown size={14} className={catOpen ? "rotate-180" : ""} />
            </button>
            <div className={`nav-dropdown-menu ${catOpen ? "open" : ""}`}>
              <div className="dropdown-col">
                <span className="dropdown-title">MOVIES</span>
                <Link href="/movies?category=4K+Movies" onClick={() => { setCatOpen(false); setMenu(false); }}>
                  4K Movies
                </Link>
                <Link href="/movies?category=Dual+Audio" onClick={() => { setCatOpen(false); setMenu(false); }}>
                  Dual Audio
                </Link>
                <Link href="/movies?category=Hindi+Dubbed" onClick={() => { setCatOpen(false); setMenu(false); }}>
                  Hindi Dubbed
                </Link>
                <Link href="/movies?category=English+Movies" onClick={() => { setCatOpen(false); setMenu(false); }}>
                  English Movies
                </Link>
                <Link href="/movies?category=Animation" onClick={() => { setCatOpen(false); setMenu(false); }}>
                  Animation
                </Link>
                <Link href="/movies?category=South+Hindi+Dubbed" onClick={() => { setCatOpen(false); setMenu(false); }}>
                  South Hindi Dubbed
                </Link>
              </div>
              <div className="dropdown-col">
                <span className="dropdown-title">SERIES</span>
                <Link href="/series?category=English+Series" onClick={() => { setCatOpen(false); setMenu(false); }}>
                  English Series
                </Link>
                <Link href="/series?category=Hindi+Dubbed+Series" onClick={() => { setCatOpen(false); setMenu(false); }}>
                  Hindi Dubbed Series
                </Link>
                <Link href="/series?category=Korean+Drama" onClick={() => { setCatOpen(false); setMenu(false); }}>
                  Korean Drama
                </Link>
                <Link href="/series?category=Anime" onClick={() => { setCatOpen(false); setMenu(false); }}>
                  Anime
                </Link>
              </div>
            </div>
          </div>
          <Link
            href="/library"
            onClick={() => { setMenu(false); setCatOpen(false); }}
            className={pathname === "/library" ? "active" : ""}
          >
            My space
          </Link>
        </nav>
        <div className="nav-right">
          <button
            aria-label="Search catalogue"
            className="icon-button"
            onClick={openSearch}
          >
            <Search size={20} />
          </button>
          <span className="edition">EBN EDITION</span>
          <button
            className="menu-toggle icon-button"
            aria-label="Toggle navigation"
            onClick={() => setMenu(!menu)}
          >
            <Menu />
          </button>
          <Link className="avatar" href="/library" aria-label="My space">
            P
          </Link>
        </div>
      </header>
      <main id="content">{children}</main>
      <footer className="footer">
        <Link href="/" className="brand">
          pin<span>flix</span>
          <i />
        </Link>
        <p>A world of stories. A space of your own.</p>
        <span>
          Catalogue by CineplexBD · Availability varies by connection.
        </span>
      </footer>
      {open && (
        <div
          className="search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Search catalogue"
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Tab") {
              const els = Array.from(
                e.currentTarget.querySelectorAll<HTMLElement>("button,input,a"),
              );
              const first = els[0],
                last = els.at(-1);
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
              }
            }
          }}
        >
          <div className="search-panel">
            <div className="search-input">
              <Search />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  if (e.target.value.trim().length < 2) setItems([]);
                }}
                placeholder="Find your next story"
                aria-label="Search titles"
                role="combobox"
                aria-expanded={items.length > 0}
                aria-controls="suggestions"
                aria-activedescendant={
                  active >= 0 ? "suggestion-" + active : undefined
                }
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(items.length - 1, a + 1));
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(-1, a - 1));
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (active >= 0 && items[active]) {
                      setOpen(false);
                      router.push("/title/" + items[active].id);
                    } else search();
                  }
                }}
              />
              <button
                className="icon-button"
                aria-label="Close search"
                onClick={() => setOpen(false)}
              >
                <X />
              </button>
            </div>
            {loading && <p className="muted">Searching…</p>}
            <div id="suggestions" role="listbox">
              {items.map((t, i) => (
                <Link
                  id={"suggestion-" + i}
                  role="option"
                  aria-selected={active === i}
                  className={"suggestion " + (active === i ? "selected" : "")}
                  href={"/title/" + t.id}
                  key={t.id}
                  onClick={() => setOpen(false)}
                >
                  <Artwork src={t.poster} alt={t.title} />
                  <div>
                    <strong>{t.title}</strong>
                    <small>
                      {t.year} · {t.kind === "series" ? "Series" : "Movie"} ·{" "}
                      {t.category}
                    </small>
                  </div>
                  <ArrowUpRight size={18} />
                </Link>
              ))}
            </div>
            {q.length > 1 && (
              <button className="text-button" onClick={() => search()}>
                See all results for “{q}” <ArrowUpRight size={16} />
              </button>
            )}
            {!q && (
              <>
                <p className="eyebrow">RECENT SEARCHES</p>
                <div className="chips">
                  {recent.length ? (
                    recent.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setQ(s);
                          search(s);
                        }}
                      >
                        {s}
                      </button>
                    ))
                  ) : (
                    <p className="muted">
                      Search movies, series, languages or years.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
