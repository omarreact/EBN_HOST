import { z } from "zod";
export const TitleSchema = z.object({
  id: z.string().regex(/^(movie|series)-\d+$/),
  providerId: z.string().regex(/^\d+$/),
  kind: z.enum(["movie", "series"]),
  title: z.string().min(1).max(400),
  poster: z.string().nullable(),
  backdrop: z.string().nullable().default(null),
  year: z.number().int().nullable(),
  category: z.string().default(""),
  language: z.string().nullable().default(null),
  quality: z.string().nullable().default(null),
  rating: z.string().nullable().default(null),
  mature: z.boolean().default(false),
  addedLabel: z.string().nullable().default(null),
  synopsis: z.string().default(""),
  genres: z.array(z.string()).default([]),
  cast: z.array(z.string()).default([]),
  runtime: z.string().nullable().default(null),
  seasons: z.array(z.number().int()).default([]),
});
export type Title = z.infer<typeof TitleSchema>;
export type Category = {
  name: string;
  kind: "movie" | "series";
  mature: boolean;
};
export type Episode = {
  number: number;
  season: number;
  title: string;
  thumbnail: string | null;
  quality: string | null;
};
export type Detail = {
  title: Title;
  episodes: Episode[];
  season: number;
  related: Title[];
};
export type Catalogue = {
  items: Title[];
  categories: Category[];
  years: number[];
  hasNext: boolean;
  page: number;
  stale: boolean;
  retrievedAt: string;
};
export type Playback = {
  status:
    | "ready"
    | "authorization_required"
    | "restricted"
    | "unavailable"
    | "unsupported";
  message: string;
  url?: string;
  format?: "mp4" | "hls";
  subtitles?: { url: string; label: string; language: string }[];
  checkedAt: string;
};
export const BASE = "/ebn-host-live";
export const api = (path: string) => BASE + "/api" + path;
