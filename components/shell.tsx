"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
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

  // Focus input and lock body scrolling when search overlay opens
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        input.current?.focus();
      }, 60);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  const openSearch = useCallback(() => {
    setMenu(false);
    const r = read<unknown>("search", []);
    setRecent(
      Array.isArray(r)
        ? r.filter((x): x is string => typeof x === "string").slice(0, 8)
        : [],
    );
    setOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setQ("");
    setItems([]);
    input.current?.blur();
  }, []);

  // Global search shortcut: Pressing "/" opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(tag) && !open) {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, openSearch]);

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
    const next = (value || q).trim();
    if (!next) return;
    write(
      "search",
      [next, ...recent.filter((x) => x !== next)].slice(0, 8),
    );
    closeSearch();
    router.push("/search?q=" + encodeURIComponent(next));
  }

  function submitSearch(event?: React.FormEvent) {
    event?.preventDefault();
    search();
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
          {/* Quick search button inside mobile drawer */}
          <button
            type="button"
            className="mobile-search-trigger"
            onClick={openSearch}
          >
            <Search size={16} />
            <span>Search catalogue...</span>
          </button>

          <Link
            href="/"
            onClick={() => { setMenu(false); setCatOpen(false); }}
            className={pathname === "/" ? "active" : ""}
          >
            Home
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
            TV Series
          </Link>
          <Link
            href="/my-list"
            onClick={() => { setMenu(false); setCatOpen(false); }}
            className={pathname === "/my-list" || pathname === "/library" ? "active" : ""}
          >
            My List
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
            href="/services"
            onClick={() => { setMenu(false); setCatOpen(false); }}
            className={pathname === "/services" ? "active" : ""}
          >
            Services
          </Link>
          <Link
            href="/about"
            onClick={() => { setMenu(false); setCatOpen(false); }}
            className={pathname === "/about" ? "active" : ""}
          >
            About
          </Link>
        </nav>
        <div className="nav-right">
          <button
            aria-label="Search catalogue (press /)"
            className="icon-button flex items-center gap-1.5"
            onClick={openSearch}
            title="Search (press /)"
          >
            <Search size={19} />
          </button>
          <span className="edition">EBN EDITION</span>
          <button
            className="menu-toggle icon-button"
            aria-label="Toggle navigation"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link className="avatar" href="/my-list" aria-label="My List and Profile">
            P
          </Link>
        </div>
      </header>

      {/* Touch-to-dismiss backdrop for mobile navigation menu */}
      {menu && (
        <div
          className="mobile-backdrop"
          onClick={() => {
            setMenu(false);
            setCatOpen(false);
          }}
          aria-hidden="true"
        />
      )}

      <main id="content">{children}</main>
      
      {/* Footer */}
      <footer className="footer border-t border-white/10 mt-20 pt-16 pb-12 px-6 sm:px-12 bg-[#0a0d0b]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10 pb-12 border-b border-white/10">
          <div>
            <Link href="/" className="brand">
              <span className="brand-mark">
                <Play size={15} fill="currentColor" />
              </span>
              pin<span>flix</span>
              <i />
            </Link>
            <p className="text-sm text-[#9ea799] mt-3 max-w-sm">
              Cinematic entertainment streaming platform engineered for pristine playback and instant discovery.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold tracking-wider text-[#88b596] uppercase">Navigation</span>
              <Link href="/" className="text-white/70 hover:text-white transition-colors">Home</Link>
              <Link href="/movies" className="text-white/70 hover:text-white transition-colors">Movies A–Z</Link>
              <Link href="/series" className="text-white/70 hover:text-white transition-colors">TV Series A–Z</Link>
              <Link href="/my-list" className="text-white/70 hover:text-white transition-colors">My List & Progress</Link>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold tracking-wider text-[#88b596] uppercase">Platform</span>
              <Link href="/about" className="text-white/70 hover:text-white transition-colors">About PinFlix</Link>
              <Link href="/services" className="text-white/70 hover:text-white transition-colors">Our Services</Link>
              <Link href="/search" className="text-white/70 hover:text-white transition-colors">Search Engine</Link>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold tracking-wider text-[#88b596] uppercase">Legal</span>
              <Link href="/privacy-policy" className="text-white/70 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="text-white/70 hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <span>© {new Date().getFullYear()} PinFlix. All rights reserved. EBN Edition.</span>
          <span>Adaptive HLS • Dual Audio • HTTP Range Proxied</span>
        </div>
      </footer>

      {open && (
        <div
          className="search-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Search catalogue"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSearch();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeSearch();
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
          <form className="search-panel" onSubmit={submitSearch}>
            <div className="search-input">
              <Search className="search-prefix-icon" size={20} />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  if (e.target.value.trim().length < 2) setItems([]);
                }}
                placeholder="Search movies, series, cast..."
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
                      closeSearch();
                      const t = items[active];
                      router.push(t.kind === "series" ? "/series/" + t.id : "/movies/" + t.id);
                    } else search();
                  }
                }}
              />
              {q.length > 0 && (
                <button
                  type="button"
                  className="search-clear-btn"
                  aria-label="Clear search query"
                  onClick={() => {
                    setQ("");
                    setItems([]);
                    input.current?.focus();
                  }}
                >
                  <X size={15} />
                </button>
              )}
              <button
                type="button"
                className="search-close-btn"
                aria-label="Close search"
                onClick={closeSearch}
              >
                Cancel
              </button>
            </div>
            {loading && <p className="muted search-loading">Searching catalogue…</p>}
            <div id="suggestions" role="listbox">
              {items.map((t, i) => {
                const targetHref = t.kind === "series" ? `/series/${t.id}` : `/movies/${t.id}`;
                return (
                  <Link
                    id={"suggestion-" + i}
                    role="option"
                    aria-selected={active === i}
                    className={"suggestion " + (active === i ? "selected" : "")}
                    href={targetHref}
                    key={t.id}
                    onClick={() => {
                      closeSearch();
                    }}
                  >
                    <Artwork src={t.poster} alt={t.title} />
                    <div className="suggestion-info">
                      <strong>{t.title}</strong>
                      <small>
                        {t.year} · {t.kind === "series" ? "Series" : "Movie"}
                        {t.category ? ` · ${t.category}` : ""}
                      </small>
                    </div>
                    <ArrowUpRight size={17} className="suggestion-arrow" />
                  </Link>
                );
              })}
            </div>
            {q.length > 1 && (
              <button type="button" className="text-button search-all-results-btn" onClick={() => search()}>
                See all results for “{q}” <ArrowUpRight size={16} />
              </button>
            )}
            {!q && (
              <div className="search-recents-section">
                <p className="eyebrow">RECENT SEARCHES</p>
                <div className="chips">
                  {recent.length ? (
                    recent.map((s) => (
                      <button
                        type="button"
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
              </div>
            )}
          </form>
        </div>
      )}
    </>
  );
}
