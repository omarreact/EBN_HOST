import { z } from "zod";
export const QuerySchema = z.object({
  q: z.string().max(120).catch("").default(""),
  category: z.string().max(160).catch("").default(""),
  year: z
    .string()
    .regex(/^(18|19|20)\d\d$/)
    .catch("")
    .default(""),
  yearFrom: z
    .string()
    .regex(/^(18|19|20)\d\d$/)
    .catch("")
    .default(""),
  yearTo: z
    .string()
    .regex(/^(18|19|20)\d\d$/)
    .catch("")
    .default(""),
  genre: z.string().max(80).catch("").default(""),
  language: z.string().max(30).catch("").default(""),
  quality: z.string().max(20).catch("").default(""),
  country: z.string().max(80).catch("").default(""),
  letter: z
    .string()
    .regex(/^[A-Z#]$/)
    .catch("")
    .default(""),
  status: z.enum(["", "ongoing", "completed"]).catch("").default(""),
  universe: z.enum(["", "marvel", "dc"]).catch("").default(""),
  sort: z
    .enum(["recent", "title", "title-desc", "year", "year-asc"])
    .catch("title")
    .default("title"),
  page: z.coerce.number().int().min(1).max(10000).catch(1).default(1),
});
export type CatalogueFilters = z.infer<typeof QuerySchema>;
export function queryParams(f: CatalogueFilters, kind?: "movie" | "series") {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => {
    if (
      (k === "yearFrom" || k === "yearTo") &&
      v !== "" &&
      !/^(18|19|20)\d\d$/.test(String(v))
    )
      return;
    if (v !== "" && !(k === "page" && v === 1)) p.set(k, String(v));
  });
  if (kind) p.set("kind", kind);
  return p;
}
export function providerQuery(f: CatalogueFilters, kind?: "movie" | "series") {
  return {
    ...f,
    kind,
    year: f.year ? Number(f.year) : undefined,
    yearFrom: f.yearFrom ? Number(f.yearFrom) : undefined,
    yearTo: f.yearTo ? Number(f.yearTo) : undefined,
    directory: true,
  };
}
