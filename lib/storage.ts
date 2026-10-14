"use client";
import { z } from "zod";
import { TitleSchema, type Title } from "./model";
const Entry = z.object({
  title: TitleSchema,
  position: z.number().min(0),
  duration: z.number().min(0),
  season: z.number().optional(),
  episode: z.number().optional(),
  updatedAt: z.number(),
});
export type Progress = z.infer<typeof Entry>;
const key = "pinflix:v1:";
export function read<T>(name: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key + name) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
export function write(name: string, value: unknown) {
  try {
    localStorage.setItem(key + name, JSON.stringify(value));
    window.dispatchEvent(new Event("pinflix-storage"));
  } catch {}
}
export function history(): Progress[] {
  const result = z.array(Entry).safeParse(read("history", []));
  return result.success ? result.data : [];
}
export function saved(): Title[] {
  const result = z.array(TitleSchema).safeParse(read("list", []));
  return result.success ? result.data : [];
}
export function toggleSave(title: Title) {
  const all = saved();
  write(
    "list",
    all.some((t) => t.id === title.id)
      ? all.filter((t) => t.id !== title.id)
      : [title, ...all].slice(0, 200),
  );
}
export function saveProgress(entry: Progress) {
  const all = history();
  write(
    "history",
    [
      entry,
      ...all.filter(
        (e) =>
          !(
            e.title.id === entry.title.id &&
            e.season === entry.season &&
            e.episode === entry.episode
          ),
      ),
    ].slice(0, 200),
  );
}
export function removeSaved(titleId: string) {
  const all = saved();
  write("list", all.filter((t) => t.id !== titleId));
}
export function removeProgress(titleId: string, season?: number, episode?: number) {
  const all = history();
  write(
    "history",
    all.filter(
      (e) =>
        !(
          e.title.id === titleId &&
          (season === undefined || e.season === season) &&
          (episode === undefined || e.episode === episode)
        ),
    ),
  );
}
export function resume(title: Title, season?: number, episode?: number) {
  return history().find(
    (e) =>
      e.title.id === title.id && e.season === season && e.episode === episode,
  );
}
