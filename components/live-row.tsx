"use client";
import { useEffect, useState } from "react";
import { api, type Catalogue, type Title } from "@/lib/model";
import { Row } from "./cards";
export function LiveRow({
  kind,
  initial,
  kicker,
  title,
}: {
  kind: "movie" | "series";
  initial: Title[];
  kicker: string;
  title: string;
}) {
  const [items, setItems] = useState(initial);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);
    fetch(api(`/catalogue?kind=${kind}`), { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const data: Catalogue = await r.json();
        if (!controller.signal.aborted && !data.stale && data.items.length)
          setItems(data.items.slice(0, 12));
      })
      .catch(() => {})
      .finally(() => clearTimeout(timeout));
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [kind]);
  return (
    <Row
      kicker={kicker}
      title={title}
      items={items}
      href={kind === "movie" ? "/movies/" : "/series/"}
    />
  );
}
