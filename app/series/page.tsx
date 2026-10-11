import { catalogue } from "@/lib/provider";
import { Browse } from "@/components/browse";
export const dynamic = "force-dynamic";
export default async function Series({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  return (
    <Browse
      kind="series"
      initialCategory={p.category || ""}
      initial={await catalogue({ kind: "series", category: p.category })}
    />
  );
}
