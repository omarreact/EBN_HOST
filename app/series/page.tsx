import { catalogue } from "@/lib/provider";
import { DirectoryList } from "@/components/directory-list";

export const dynamic = "force-dynamic";

export default async function Series({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const data = await catalogue({
    kind: "series",
    category: p.category,
  });

  return (
    <DirectoryList
      key={JSON.stringify(p)}
      kind="series"
      initialCategory={p.category || ""}
      initial={data}
    />
  );
}
