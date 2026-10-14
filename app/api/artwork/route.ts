import { NextRequest, NextResponse } from "next/server";
import { safeFetch, allowedUrl } from "@/lib/provider/http";
export async function GET(req: NextRequest) {
  try {
    const value = req.nextUrl.searchParams.get("url");
    if (!value || value.length > 1200)
      return new NextResponse(null, { status: 400 });
    const destination = allowedUrl(value);
    if (destination.hostname !== "cineplexbd.net")
      return new NextResponse(null, { status: 400 });
    const response = await safeFetch(destination.href);
    const type = response.headers.get("content-type") || "";
    if (
      !response.ok ||
      !/^image\/(jpeg|png|webp|gif)$/.test(type.split(";")[0])
    )
      return new NextResponse(null, { status: 404 });
    const reader = response.body?.getReader();
    if (!reader) return new NextResponse(null, { status: 404 });
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 2_000_000) throw new Error("image_too_large");
        chunks.push(value);
      }
    } finally {
      await reader.cancel().catch(() => {});
    }
    const image = new Uint8Array(size);
    let at = 0;
    for (const chunk of chunks) {
      image.set(chunk, at);
      at += chunk.byteLength;
    }
    return new NextResponse(image, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
