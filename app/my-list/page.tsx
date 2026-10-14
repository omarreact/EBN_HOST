import { Library } from "@/components/library";

export const metadata = {
  title: "My List | PinFlix",
  description: "Your saved movies, series, and continue watching progress.",
};

export default async function MyListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  return (
    <Library
      initialTab={
        p.tab === "continue-watching" ? "continue-watching" : "watch-later"
      }
    />
  );
}
