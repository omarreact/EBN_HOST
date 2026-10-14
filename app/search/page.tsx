import { catalogue } from "@/lib/provider";
import { Browse } from "@/components/browse";
import { providerQuery, QuerySchema } from "@/lib/catalogue-query";
export const dynamic = "force-dynamic";
export const metadata = { title: "Search" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const filters = QuerySchema.parse({ sort: "recent", ...p });
  const kind =
    p.kind === "movie" ? "movie" : p.kind === "series" ? "series" : "";
  const data = await catalogue(providerQuery(filters, kind || undefined));
  return (
    <Browse
      key={JSON.stringify(p)}
      initial={data}
      initialFilters={filters}
      initialKind={kind}
    />
  );
}
