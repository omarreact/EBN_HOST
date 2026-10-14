import { catalogue } from "@/lib/provider";
import { DirectoryList } from "@/components/directory-list";

export const dynamic = "force-dynamic";

export default async function Movies({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const data = await catalogue({
    kind: "movie",
    category: p.category,
    year: p.year ? Number(p.year) : undefined,
  });

  return (
    <DirectoryList
      key={JSON.stringify(p)}
      kind="movie"
      initialCategory={p.category || ""}
      initialYear={p.year || ""}
      initial={data}
    />
  );
}
