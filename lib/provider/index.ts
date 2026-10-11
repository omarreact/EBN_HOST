import * as cheerio from "cheerio";
import { z } from "zod";
import type { Title, Catalogue, Detail, Playback } from "../model";
import { TitleSchema } from "../model";
import {
  categoriesFromHtml,
  titlesFromHtml,
  yearsFromHtml,
  searchFromJson,
  detailFromHtml,
  sourceFromHtml,
  imageUrl,
  dedupe,
  isMature,
  ORIGIN,
} from "./normalize";
import {
  html,
  cached,
  safeFetch,
  boundedText,
  allowedUrl,
  ProviderError,
} from "./http";
import snapshot from "../../data/catalogue.json";
import { titleMatch } from "../search";
const seed = TitleSchema.array().parse(snapshot.items);
const seedCategories = z
  .array(
    z.object({
      name: z.string(),
      kind: z.enum(["movie", "series"]),
      mature: z.boolean(),
    }),
  )
  .parse(snapshot.categories);
const index = new Map(seed.map((t) => [t.id, t]));
const permitted = (t: Title) =>
  !t.mature || process.env.PINFLIX_MATURE_ENABLED === "true";
export type Query = {
  kind?: "movie" | "series";
  category?: string;
  q?: string;
  year?: number;
  language?: string;
  quality?: string;
  sort?: string;
  page?: number;
  actor?: string;
};
export function applyFilters(items: Title[], q: Query): Title[] {
  const out = items.filter(
    (t) =>
      permitted(t) &&
      (!q.kind || t.kind === q.kind) &&
      (!q.category || t.category === q.category) &&
      (!q.year || t.year === q.year) &&
      (!q.language || t.language === q.language) &&
      (!q.quality || t.quality?.toLowerCase() === q.quality.toLowerCase()),
  );
  if (q.sort === "title") out.sort((a, b) => a.title.localeCompare(b.title));
  else if (q.sort === "year") out.sort((a, b) => (b.year || 0) - (a.year || 0));
  else out.sort((a, b) => Number(b.providerId) - Number(a.providerId));
  return out;
}
function matches(t: Title, q: string): boolean {
  return (
    titleMatch(t.title, q) ||
    [t.year, t.category, t.language, ...t.cast]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase())
  );
}
export async function catalogue(q: Query = {}): Promise<Catalogue> {
  const page = Math.max(1, Math.min(q.page || 1, 10000));
  const meta = await cached("categories", 900_000, async () => {
    try {
      const h = await html("/");
      return { categories: categoriesFromHtml(h), years: yearsFromHtml(h) };
    } catch {
      return { categories: seedCategories, years: snapshot.years };
    }
  });
  let items: Title[] = [];
  let stale = false;
  let hasNext = false;
  const params = new URLSearchParams({ page: String(page) });
  if (q.year) params.set("year[]", String(q.year));
  if (q.category) params.set("category", q.category);
  if (
    q.category &&
    !meta.categories.some(
      (c) => c.name === q.category && (!q.kind || c.kind === q.kind),
    )
  )
    throw new ProviderError("unknown_category", 400);
  if (
    q.category &&
    isMature(q.category) &&
    process.env.PINFLIX_MATURE_ENABLED !== "true"
  )
    return {
      items: [],
      ...meta,
      hasNext: false,
      page,
      stale: false,
      retrievedAt: new Date().toISOString(),
    };
  try {
    if (q.q || q.actor) {
      params.set(q.actor ? "actors" : "q", q.actor || q.q!);
      const h = await html("/search.php?" + params);
      items = titlesFromHtml(h);
      hasNext = nextPage(h, page);
      if (!items.length && q.q && !q.actor) {
        const json = await boundedText(
          await safeFetch(
            ORIGIN +
              "/search_ajax.php?" +
              new URLSearchParams({ q: q.q, limit: "40" }),
          ),
        );
        items = searchFromJson(JSON.parse(json));
      }
    } else if (q.category) {
      const h = await html(
        `/${q.kind === "series" ? "tcategory" : "category"}.php?` + params,
      );
      items = titlesFromHtml(h, q.kind);
      hasNext = nextPage(h, page);
    } else if (q.kind === "series") {
      const h = await html("/tvs.php?" + params);
      items = titlesFromHtml(h, "series");
      hasNext = nextPage(h, page);
    } else {
      const h = await html(
        page === 1 && !q.year ? "/" : "/category.php?" + params,
      );
      items = titlesFromHtml(h, q.kind);
      hasNext = page === 1 && !q.year ? true : nextPage(h, page);
    }
    if (q.q && !items.length)
      items = [...index.values()].filter((t) => matches(t, q.q!));
    items.forEach((t) => {
      index.set(t.id, t);
    });
    if (index.size > 2500) {
      for (const key of [...index.keys()].slice(0, index.size - 2500))
        index.delete(key);
    }
  } catch {
    stale = true;
    items =
      page === 1
        ? [...index.values()].filter((t) => !q.q || matches(t, q.q))
        : [];
  }
  return {
    items: applyFilters(dedupe(items), q),
    ...meta,
    hasNext,
    page,
    stale,
    retrievedAt: stale ? snapshot.retrievedAt : new Date().toISOString(),
  };
}
function nextPage(h: string, page: number): boolean {
  const $ = cheerio.load(h);
  return $("a[href]")
    .toArray()
    .some((el) => {
      try {
        return (
          Number(
            new URL($(el).attr("href")!, ORIGIN).searchParams.get("page"),
          ) ===
          page + 1
        );
      } catch {
        return false;
      }
    });
}
export async function suggestions(q: string): Promise<Title[]> {
  if (q.length < 2) return [];
  try {
    const text = await cached("suggest:" + q, 60_000, () =>
      boundedTextSafe(
        "/search_ajax.php?" + new URLSearchParams({ q, limit: "12" }),
      ),
    );
    const items = searchFromJson(JSON.parse(text));
    items.forEach((t) => index.set(t.id, t));
    return (
      items.length
        ? items
        : [...index.values()].filter((t) => matches(t, q)).slice(0, 12)
    ).filter(permitted);
  } catch {
    return [...index.values()]
      .filter((t) => permitted(t) && matches(t, q))
      .slice(0, 12);
  }
}
async function boundedTextSafe(path: string) {
  return boundedText(await safeFetch(ORIGIN + path));
}
const MetaSchema = z.object({
  rating: z.string().optional(),
  synopsis: z.string().optional(),
  cast: z.array(z.object({ name: z.string() })).optional(),
  episodes: z
    .record(
      z.string(),
      z.object({
        episode_number: z.number(),
        title: z.string(),
        still: z.string().nullable().optional(),
      }),
    )
    .optional(),
});
export async function detail(id: string, season = 1): Promise<Detail> {
  if (!/^(movie|series)-\d+$/.test(id))
    throw new ProviderError("invalid_id", 400);
  return cached(`detail:${id}:${season}`, 180_000, async () => {
    const [kind, pid] = id.split("-");
    const p =
      `/${kind === "series" ? "watch" : "view"}.php?` +
      new URLSearchParams({ id: pid, season: String(season) });
    let d;
    try {
      d = detailFromHtml(await html(p), id, season);
    } catch (e) {
      const fallback = snapshot.details.find(
        (x) => x.title.id === id && x.season === season,
      );
      if (!fallback) throw e;
      d = { ...fallback, title: TitleSchema.parse(fallback.title) };
    }
    const known = index.get(id);
    if (known)
      d.title = {
        ...d.title,
        category: known.category || d.title.category,
        language: known.language || d.title.language,
        quality: known.quality || d.title.quality,
        rating: known.rating || d.title.rating,
        mature: known.mature || d.title.mature,
      };
    if (kind === "series")
      try {
        const meta = MetaSchema.parse(
          JSON.parse(await boundedTextSafe(p + "&meta=1")),
        );
        d.title.synopsis = meta.synopsis || d.title.synopsis;
        d.title.rating = meta.rating || d.title.rating;
        d.title.cast = meta.cast?.map((c) => c.name) || d.title.cast;
        d.episodes = d.episodes.map((e) => ({
          ...e,
          title: meta.episodes?.[String(e.number)]?.title || e.title,
          thumbnail:
            imageUrl(meta.episodes?.[String(e.number)]?.still) || e.thumbnail,
        }));
      } catch {
        /* HTML metadata is sufficient. */
      }
    if (!permitted(d.title)) throw new ProviderError("mature_disabled", 403);
    index.set(id, d.title);
    return {
      ...d,
      related: [...index.values()]
        .filter((t) => t.id !== id && t.kind === kind && permitted(t))
        .slice(0, 12),
    };
  });
}
export async function resolvePlayback(
  id: string,
  season = 1,
  episode = 1,
): Promise<Playback> {
  const checkedAt = new Date().toISOString();
  if (process.env.CINEPLEX_PLAYBACK_AUTHORIZED !== "true")
    return {
      status: "authorization_required",
      message: "Playback is not available for this title yet.",
      checkedAt,
    };
  const d = await detail(id, season);
  if (d.title.mature && process.env.PINFLIX_MATURE_ENABLED !== "true")
    return {
      status: "restricted",
      message: "This title is restricted.",
      checkedAt,
    };
  if (
    d.title.kind === "series" &&
    !d.episodes.some((e) => e.number === episode)
  )
    return {
      status: "unavailable",
      message: "This episode is not available.",
      checkedAt,
    };
  const path =
    d.title.kind === "movie"
      ? "/player.php?" + new URLSearchParams({ id: d.title.providerId })
      : "/watch.php?" +
        new URLSearchParams({
          id: d.title.providerId,
          season: String(season),
          ep: String(episode),
        });
  try {
    // Player pages can mint expiring URLs; never cache a resolved playback token.
    const source = sourceFromHtml(await boundedTextSafe(path));
    if (!source)
      return {
        status: "unsupported",
        message: "No supported video source is available.",
        checkedAt,
      };
    allowedUrl(source.url, true);
    source.subtitles = source.subtitles.filter((t) => {
      try {
        allowedUrl(t.url, true);
        return true;
      } catch {
        return false;
      }
    });
    const res = await safeFetch(
      source.url,
      { headers: source.format === "mp4" ? { Range: "bytes=0-1023" } : {} },
      true,
    );
    if (!res.ok) {
      await res.body?.cancel();
      return {
        status:
          res.status === 403 || res.status === 401
            ? "restricted"
            : "unavailable",
        message:
          res.status === 403 || res.status === 401
            ? "The provider does not allow access from this connection."
            : "This video is currently unavailable.",
        checkedAt,
      };
    }
    const type = res.headers.get("content-type") || "";
    if (source.format === "mp4") {
      await res.body?.cancel();
      if (!type.includes("video/") || res.status !== 206)
        return {
          status: "unsupported",
          message: "This source does not support reliable seeking.",
          checkedAt,
        };
    } else {
      const playlist = await boundedText(res, 150_000);
      if (!playlist.startsWith("#EXTM3U"))
        return {
          status: "unsupported",
          message: "The provider returned an invalid playlist.",
          checkedAt,
        };
      const lines = playlist
        .split("\n")
        .filter((l) => l.trim() && !l.startsWith("#"));
      for (const line of lines)
        allowedUrl(new URL(line.trim(), source.url).href, true);
    }
    return { status: "ready", message: "", ...source, checkedAt };
  } catch {
    return {
      status: "unavailable",
      message: "We could not reach this video. Try again later.",
      checkedAt,
    };
  }
}
