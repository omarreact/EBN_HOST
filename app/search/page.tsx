import { catalogue } from "@/lib/provider";
import { Browse } from "@/components/browse";
export const dynamic = "force-dynamic";
export default async function Search({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  return (
    <Browse
      key={JSON.stringify(p)}
      initialQuery={p.q || ""}
      initialYear={p.year || ""}
      initial={await catalogue({
        q: p.q,
        year: p.year ? Number(p.year) : undefined,
      })}
    />
  );
}
