import type { Title } from "./model";
import { universeFor } from "./curation";
import { titleMatch } from "./search";

export const alphabet = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
export function titleLetter(title: string) {
  const first = title
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .charAt(0)
    .toUpperCase();
  return /^[A-Z]$/.test(first) ? first : "#";
}
export type DirectoryFilters = {
  q?: string;
  category?: string;
  year?: number;
  yearFrom?: number;
  yearTo?: number;
  genre?: string;
  language?: string;
  quality?: string;
  country?: string;
  letter?: string;
  status?: string;
  universe?: string;
  sort?: string;
};
export function filterTitles(items: Title[], f: DirectoryFilters) {
  return items
    .filter(
      (t) =>
        (!f.q ||
          titleMatch(t.title, f.q) ||
          t.aliases.some((a) => titleMatch(a, f.q!))) &&
        (!f.category || t.category === f.category) &&
        (!f.year || t.year === f.year) &&
        (!f.yearFrom || (!!t.year && t.year >= f.yearFrom)) &&
        (!f.yearTo || (!!t.year && t.year <= f.yearTo)) &&
        (!f.genre || t.genres.includes(f.genre)) &&
        (!f.language || t.language === f.language) &&
        (!f.country || t.country === f.country) &&
        (!f.quality || t.quality?.toLowerCase() === f.quality.toLowerCase()) &&
        (!f.letter || titleLetter(t.title) === f.letter) &&
        (!f.status || t.seriesStatus === f.status) &&
        (!f.universe || universeFor(t) === f.universe),
    )
    .sort((a, b) => {
      if (f.sort === "title" || f.sort === "title-desc")
        return (
          a.title.localeCompare(b.title) * (f.sort === "title-desc" ? -1 : 1)
        );
      if (f.sort === "year" || f.sort === "year-asc") {
        if (!a.year) return b.year ? 1 : 0;
        if (!b.year) return -1;
        return (
          (b.year - a.year) * (f.sort === "year-asc" ? -1 : 1) ||
          a.title.localeCompare(b.title)
        );
      }
      return Number(b.providerId) - Number(a.providerId);
    });
}
