import { notFound } from "next/navigation";
import { detail, resolvePlayback } from "@/lib/provider";
import { DetailView } from "@/components/detail";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    return { title: (await detail(id)).title.title };
  } catch {
    return { title: "Story unavailable" };
  }
}
export default async function TitlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^(movie|series)-\d+$/.test(id)) notFound();
  const d = await detail(id).catch(() => null);
  if (!d) notFound();
  const capability = await resolvePlayback(
    id,
    d.season,
    d.episodes[0]?.number || 1,
  );
  return <DetailView initial={d} initialPlayback={capability} />;
}
