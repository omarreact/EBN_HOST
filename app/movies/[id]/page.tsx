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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = rawId.startsWith("movie-") ? rawId : `movie-${rawId}`;
  const d = await detail(id).catch(() => null);
  if (!d) notFound();
  const capability = await resolvePlayback(id);
  return <DetailView initial={d} initialPlayback={capability} />;
}
