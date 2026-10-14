import type { Title } from "./model";

// Reviewed catalogue identities. Never infer a universe from genres or keywords.
export const universeById: Record<string, "marvel" | "dc"> = {
  "movie-78724": "marvel", // Spider-Man: Brand New Day
  "movie-34110": "dc", // The Dark Knight
};
export function universeFor(title: Title) {
  return title.universe ?? universeById[title.id] ?? null;
}
export function titleHref(title: Title) {
  return `/${title.kind === "series" ? "series" : "movies"}/${title.id}/`;
}
