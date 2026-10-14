import { z } from "zod";
import { TitleSchema } from "./model";
import { PreferencesSchema } from "./preferences";
export const ProgressSchema = z.object({
  title: TitleSchema,
  position: z.number().finite().min(0),
  duration: z.number().finite().min(0),
  season: z.number().int().min(1).optional(),
  episode: z.number().int().min(1).optional(),
  updatedAt: z.number().finite().min(0),
});
export const LibrarySchema = z.object({
  list: z.array(TitleSchema).max(200),
  history: z.array(ProgressSchema).max(200),
  preferences: PreferencesSchema,
});
export type LibraryData = z.infer<typeof LibrarySchema>;
export function mergeLibraries(
  local: LibraryData,
  cloud: LibraryData,
): LibraryData {
  const list = [
    ...new Map([...cloud.list, ...local.list].map((t) => [t.id, t])).values(),
  ].slice(0, 200);
  const entries = new Map<string, LibraryData["history"][number]>();
  for (const e of [...cloud.history, ...local.history]) {
    const key = `${e.title.id}:${e.season}:${e.episode}`;
    const current = entries.get(key);
    if (!current || e.updatedAt > current.updatedAt) entries.set(key, e);
  }
  return {
    list,
    history: [...entries.values()]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 200),
    preferences: local.preferences,
  };
}
