"use client";
import { useState } from "react";
import { Film } from "lucide-react";
import assets from "@/data/artwork.json";
export function artworkUrl(src: string | null) {
  if (!src) return null;
  const local = (assets as Record<string, string>)[src];
  if (local) return local;
  return src.startsWith("http://cineplexbd.net/") ||
    src.startsWith("https://cineplexbd.net/")
    ? "/api/artwork/?url=" + encodeURIComponent(src)
    : src;
}
export function Artwork({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [loadedSource, setLoadedSource] = useState<string | null>(null);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const url = artworkUrl(src);
  return url && failedSource !== url ? (
    <img
      src={url}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      style={{ opacity: loadedSource === url ? undefined : 0 }}
      onLoad={() => setLoadedSource(url)}
      onError={() => setFailedSource(url)}
    />
  ) : (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={!alt || undefined}
      className={`art-fallback ${className}`}
    >
      <Film size={32} strokeWidth={1} />
      <span>{alt || "PinFlix"}</span>
    </div>
  );
}
