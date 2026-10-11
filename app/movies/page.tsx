import { catalogue } from "@/lib/provider";
import { Browse } from "@/components/browse";
export const dynamic = "force-dynamic";
export default async function Movies({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  return (
    <Browse
      kind="movie"
      initialCategory={p.category || ""}
      initialYear={p.year || ""}
      initial={await catalogue({
        kind: "movie",
        category: p.category,
        year: p.year ? Number(p.year) : undefined,
      })}
    />
  );
}
