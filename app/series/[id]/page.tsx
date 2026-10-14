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
  const id = rawId.startsWith("series-") ? rawId : `series-${rawId}`;
  try {
    return { title: (await detail(id)).title.title };
  } catch {
    return { title: "Series unavailable" };
  }
}

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = rawId.startsWith("series-") ? rawId : `series-${rawId}`;
  const d = await detail(id).catch(() => null);
  if (!d) notFound();
  const capability = await resolvePlayback(
    id,
    d.season,
    d.episodes[0]?.number || 1,
  );
  return <DetailView initial={d} initialPlayback={capability} />;
}
