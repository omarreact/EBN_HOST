import { catalogue } from "@/lib/provider";
import { QuerySchema, providerQuery } from "@/lib/catalogue-query";
import { DirectoryList } from "@/components/directory-list";
export const dynamic = "force-dynamic";
export const metadata = { title: "Movies A–Z" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const filters = QuerySchema.parse(await searchParams);
  const data = await catalogue(providerQuery(filters, "movie"));
  return (
    <DirectoryList
      key={JSON.stringify(filters)}
      kind="movie"
      initial={data}
      initialFilters={filters}
    />
  );
}
