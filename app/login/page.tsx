import { Login } from "@/components/login";
export const metadata = { title: "Sign in" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const next =
    p.next?.startsWith("/") &&
    !p.next.startsWith("//") &&
    !p.next.includes("\\")
      ? p.next
      : "/my-list";
  return <Login next={next} />;
}
