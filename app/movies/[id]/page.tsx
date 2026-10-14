import { notFound } from "next/navigation";
import { detail, resolvePlayback } from "@/lib/provider";
import { DetailView } from "@/components/detail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = rawId.startsWith("movie-") ? rawId : `movie-${rawId}`;
  try {
    return { title: (await detail(id)).title.title };
  } catch {
    return { title: "Movie unavailable" };
  }
}

export default async function MovieDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const season = Math.max(
    1,
    Math.min(999, Math.floor(Number(query.season) || 1)),
  );
  const requestedEpisode = Math.max(
    1,
    Math.min(10000, Math.floor(Number(query.episode) || 1)),
  );
  const { id: rawId } = await params;
  const id = rawId.startsWith("movie-") ? rawId : `movie-${rawId}`;
  const d = await detail(id, season).catch(() => null);
  if (!d) notFound();
  const capability = await resolvePlayback(id);
  return (
    <DetailView
      initial={d}
      initialPlayback={capability}
      initialEpisode={query.episode ? requestedEpisode : undefined}
      resumeRequested={query.resume === "1"}
    />
  );
}
