import { catalogue } from "@/lib/provider";
import { QuerySchema, providerQuery } from "@/lib/catalogue-query";
import { DirectoryList } from "@/components/directory-list";
export const dynamic = "force-dynamic";
export const metadata = { title: "Series A–Z" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const filters = QuerySchema.parse(await searchParams);
  const data = await catalogue(providerQuery(filters, "series"));
  return (
    <DirectoryList
      key={JSON.stringify(filters)}
      kind="series"
      initial={data}
      initialFilters={filters}
    />
  );
}
