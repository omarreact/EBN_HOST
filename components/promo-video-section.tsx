"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Volume2, VolumeX } from "lucide-react";

export function PromoVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Handle intersection observer to pause when outside viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-[#08090D] my-16 border-y border-white/10">
      {/* Background Video */}
      <div className="relative w-full h-[460px] md:h-[580px] lg:h-[640px] overflow-hidden">
        {!failed ? (
          <video
            ref={videoRef}
            src="https://customer-342mt1gy0ibqe0dl.cloudflarestream.com/ef234f5fd0d362d696350fccd7ebbd10/downloads/default.mp4"
            autoPlay
            loop
            muted={muted}
            playsInline
            onError={() => setFailed(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 transition-opacity duration-1000"
          />
        ) : (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at center, rgba(115,87,255,0.25) 0%, rgba(8,9,13,0.95) 75%)",
            }}
          />
        )}

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090D] via-[#08090D]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-transparent to-[#08090D]/60 z-10 pointer-events-none" />

        {/* Mute / Unmute Button */}
        {!failed && (
          <button
            type="button"
            onClick={() => setMuted(!muted)}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all cursor-pointer"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        )}

        {/* Foreground Content */}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-center">
          <div className="max-w-2xl space-y-6">
            <p className="text-[11px] tracking-[0.25em] font-semibold text-[#88b596] uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#88b596] animate-pulse" />
              EXPLORE BEYOND THE SCREEN
            </p>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.08]">
              Every Story Deserves a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-[#88b596]">
                Cinematic Experience
              </span>
            </h2>

            <p className="text-base sm:text-lg text-[#A7ADBA] font-normal leading-relaxed max-w-xl">
              Discover extraordinary movies, unforgettable series, and worlds beyond
              imagination. Streamed in pristine high-definition, wherever you are.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/movies"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-[#88b596] hover:text-black transition-all shadow-lg hover:shadow-emerald-900/20"
              >
                Explore Movies <ArrowUpRight size={18} />
              </Link>

              <Link
                href="/series"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm border border-white/15 backdrop-blur-md transition-all"
              >
                Browse Series <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
