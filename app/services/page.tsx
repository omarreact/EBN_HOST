import Link from "next/link";
import { Film, Tv, Search, Bookmark, History, Download, Sliders, CheckCircle2, Clock, Volume2 } from "lucide-react";

export const metadata = {
  title: "Our Services | PinFlix",
  description: "Explore PinFlix platform services, streaming capabilities, and player features.",
};

export default function ServicesPage() {
  const activeFeatures = [
    {
      icon: Film,
      title: "Feature Film Streaming",
      desc: "Instant high-definition streaming for hundreds of curated movies with integrated player controls and HTTP range request optimization.",
    },
    {
      icon: Tv,
      title: "Episodic Television Series",
      desc: "Multi-season television series playback with intuitive season pickers, episodic navigation, and automatic next-episode queuing.",
    },
    {
      icon: Download,
      title: "Real-Time Media Downloads",
      desc: "Direct authorized binary downloads (.mp4, .mkv) with Content-Disposition headers and rewritten proxy manifests for offline media players.",
    },
    {
      icon: Search,
      title: "Real-Time Catalog Search",
      desc: "Live debounced search engine with instant autocomplete, genre taxonomy filtering, and year range selection across the catalog.",
    },
    {
      icon: History,
      title: "Smart Continue Watching",
      desc: "Automatic device-level progress persistence that remembers your exact playback seconds and offers one-click resume.",
    },
    {
      icon: Bookmark,
      title: "Personal Watchlist (My List)",
      desc: "Save films and shows to your dedicated personal library with zero login barriers using local storage synchronization.",
    },
    {
      icon: Volume2,
      title: "Multi-Track Audio & Subtitles",
      desc: "Seamless switching between dual audio languages (e.g. Hindi dub and English original) and WebVTT caption tracks.",
    },
    {
      icon: Sliders,
      title: "YouTube-Style Video Controls",
      desc: "Picture-in-Picture, full keyboard shortcuts (J/K/L/Space/F), custom playback speed (0.5x–2.0x), and touch double-tap seeking.",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-6 sm:px-10 py-16">
      {/* Header */}
      <div className="border-b border-white/10 pb-12 mb-12">
        <p className="text-xs font-semibold tracking-widest text-[#88b596] uppercase mb-3">
          PLATFORM ARCHITECTURE & CAPABILITIES
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
          Our Services & Features
        </h1>
        <p className="text-base text-[#adb6a9] max-w-2xl leading-relaxed">
          PinFlix combines media distribution protocols with modern browser APIs to deliver fluid, responsive streaming.
        </p>
      </div>

      {/* Active Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {activeFeatures.map((feat) => {
          const Icon = feat.icon;
          return (
            <div key={feat.title} className="p-7 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-white/10 text-[#88b596]">
                    <Icon size={22} />
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#88b596]/15 text-[#a4d1b1] text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 size={12} /> Live Feature
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-[#9ea799] leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Planned Roadmap */}
      <div className="border-t border-white/10 pt-12">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-[#88b596]" />
          <h2 className="text-xl font-bold text-white">Upcoming Enhancements</h2>
        </div>
        <p className="text-xs sm:text-sm text-white/50 mb-6 max-w-xl">
          Features currently in active development for upcoming major releases.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
            <h4 className="text-sm font-semibold text-white">Multi-Device Cloud Sync</h4>
            <p className="text-xs text-white/50 mt-1">Cross-device synchronization of watchlists and history across accounts.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
            <h4 className="text-sm font-semibold text-white">Watch Parties</h4>
            <p className="text-xs text-white/50 mt-1">Synchronized playback sessions with friends via WebRTC data channels.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
            <h4 className="text-sm font-semibold text-white">Curated Offline Packs</h4>
            <p className="text-xs text-white/50 mt-1">Single-click batch downloads of entire TV seasons in zip containers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
