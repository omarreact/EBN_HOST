import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  catalogue,
  detail,
  resolvePlayback,
  suggestions,
  type Query,
} from "@/lib/provider";
import { ProviderError } from "@/lib/provider/http";
export const dynamic = "force-dynamic";
const Params = z.object({
  kind: z.enum(["movie", "series"]).optional(),
  category: z.string().max(160).optional(),
  q: z.string().max(120).optional(),
  actor: z.string().max(100).optional(),
  year: z.coerce.number().int().min(1888).max(2100).optional(),
  page: z.coerce.number().int().min(1).max(10000).optional(),
  language: z.string().max(30).optional(),
  quality: z.string().max(20).optional(),
  sort: z.enum(["recent", "title", "year"]).optional(),
  id: z
    .string()
    .regex(/^(movie|series)-\d+$/)
    .optional(),
  season: z.coerce.number().int().min(1).max(999).default(1),
  episode: z.coerce.number().int().min(1).max(10000).default(1),
});
const limits = new Map<string, { count: number; until: number }>();
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ resource: string }> },
) {
  const client = (req.headers.get("x-forwarded-for") || "shared")
    .split(",")[0]
    .trim()
    .slice(0, 80);
  const now = Date.now();
  const limit = limits.get(client);
  if (limit && limit.until > now && limit.count >= 100)
    return NextResponse.json(
      { error: "Please wait before trying again." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  if (limits.size > 1000) limits.clear();
  limits.set(client, {
    count: limit && limit.until > now ? limit.count + 1 : 1,
    until: limit && limit.until > now ? limit.until : now + 60000,
  });
  const p = Params.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!p.success)
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { resource } = await params;
  try {
    let result;
    const { id, season, episode, ...query } = p.data;
    if (resource === "catalogue") result = await catalogue(query as Query);
    else if (resource === "suggest")
      result = { items: await suggestions(query.q || "") };
    else if (resource === "detail" && id) result = await detail(id, season);
    else if (resource === "playback" && id)
      result = await resolvePlayback(id, season, episode);
    else return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json(result, {
      headers: {
        "Cache-Control":
          resource === "playback" ? "no-store" : "private, max-age=15",
      },
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof ProviderError && e.code === "mature_disabled"
            ? "This title is restricted."
            : "This collection is temporarily unavailable.",
      },
      { status: e instanceof ProviderError && e.status < 500 ? e.status : 503 },
    );
  }
}
