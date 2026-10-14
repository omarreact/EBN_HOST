import Link from "next/link";
import { Film, Tv, Shield, Zap, Monitor, Smartphone, Globe, Mail } from "lucide-react";

export const metadata = {
  title: "About | PinFlix",
  description: "Discover PinFlix's cinematic entertainment platform, mission, and streaming technology.",
};

export default function AboutPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 sm:px-10 py-16">
      {/* Hero Section */}
      <div className="border-b border-white/10 pb-12 mb-12">
        <p className="text-xs font-semibold tracking-widest text-[#88b596] uppercase mb-3">
          OUR MISSION & IDENTITY
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
          Every Story Deserves a <br className="hidden sm:inline" />
          Cinematic Experience.
        </h1>
        <p className="text-base sm:text-lg text-[#b8c2b4] max-w-2xl leading-relaxed">
          PinFlix is designed from the ground up for movie lovers and television enthusiasts who demand an uncluttered, responsive, and immersive entertainment platform.
        </p>
      </div>

      {/* Grid: What We Offer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
          <Film className="text-[#88b596] mb-4" size={28} />
          <h2 className="text-xl font-bold text-white mb-2">Unmatched Discovery</h2>
          <p className="text-sm text-[#9ea899] leading-relaxed">
            From the fastest text-first alphabetical directories to curated cinematic universes like Marvel and DC, our catalogs put finding the next great film ahead of unnecessary clutter.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
          <Zap className="text-[#88b596] mb-4" size={28} />
          <h2 className="text-xl font-bold text-white mb-2">High-Performance Playback</h2>
          <p className="text-sm text-[#9ea899] leading-relaxed">
            Our embedded media engine leverages modern HTML5, HLS adaptive streaming, multi-track audio, and customizable subtitles without intrusive redirects or popups.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
          <Shield className="text-[#88b596] mb-4" size={28} />
          <h2 className="text-xl font-bold text-white mb-2">Privacy & Reliability</h2>
          <p className="text-sm text-[#9ea899] leading-relaxed">
            Your watch positions, bookmarks, and lists stay strictly synced on your device with minimal footprint and zero invasive tracking.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
          <Globe className="text-[#88b596] mb-4" size={28} />
          <h2 className="text-xl font-bold text-white mb-2">Cross-Device Architecture</h2>
          <p className="text-sm text-[#9ea899] leading-relaxed">
            Engineered to feel native across desktop monitors, laptops, tablets, and smartphones with mobile gestures, touch double-tap seek, and orientation support.
          </p>
        </div>
      </div>

      {/* Technical Capabilities & Devices */}
      <div className="border-t border-white/10 pt-12 mb-16">
        <h2 className="text-2xl font-bold text-white mb-6">Supported Environments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
            <Monitor size={24} className="text-white/60 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white">Desktop & Laptops</h3>
              <p className="text-xs text-white/50 mt-1">Chrome, Firefox, Safari, Edge with full keyboard navigation and Picture-in-Picture.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
            <Smartphone size={24} className="text-white/60 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white">Mobile & Tablets</h3>
              <p className="text-xs text-white/50 mt-1">iOS and Android browsers with gesture controls and landscape lock.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
            <Tv size={24} className="text-white/60 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white">Connected Displays</h3>
              <p className="text-xs text-white/50 mt-1">AirPlay, Chromecast, and external monitor streaming compatibility.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Support */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#141815] to-[#0f1311] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-white">Questions or Technical Feedback?</h3>
          <p className="text-xs text-[#a0a89d] mt-1">Our engineering team is dedicated to refining your streaming experience.</p>
        </div>
        <a
          href="mailto:support@pinflix.tv"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold text-xs hover:bg-[#ebf4e1] transition-all shrink-0"
        >
          <Mail size={16} /> Contact Support
        </a>
      </div>
    </div>
  );
}
