import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, Database } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | PinFlix",
  description: "Learn how PinFlix protects your privacy, uses local storage, and handles media streaming requests.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 py-16">
      {/* Header */}
      <div className="border-b border-white/10 pb-8 mb-10">
        <p className="text-xs font-semibold tracking-widest text-[#88b596] uppercase mb-2">
          LEGAL & DATA PROTECTION
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-white/50">
          Last Updated: October 2026 • Effective Immediately
        </p>
      </div>

      <div className="space-y-10 text-sm text-[#b2bcae] leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Lock size={18} className="text-[#88b596]" /> 1. Overview & Privacy Philosophy
          </h2>
          <p>
            At PinFlix, we believe user privacy should be respected by design. We do not require invasive personal information, track you across the broader internet, or sell your viewing habits to third-party ad brokers. This policy outlines how information is handled when you browse, stream, and save content on PinFlix.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Database size={18} className="text-[#88b596]" /> 2. Local Storage & Device Data
          </h2>
          <p className="mb-2">
            To provide features such as <strong>My List (Watch Later)</strong> and <strong>Continue Watching (Playback Position)</strong>, PinFlix stores data directly within your web browser’s local storage (under the namespace <code>pinflix:v1:</code>).
          </p>
          <ul className="list-disc pl-5 space-y-1 text-white/70">
            <li>Your watch progress and bookmarks remain on your local device.</li>
            <li>You can clear this data at any moment by clearing your browser cache or clicking the removal buttons inside the library.</li>
            <li>No persistent personal identifiers are transmitted to remote tracking servers during everyday browsing.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#88b596]" /> 3. Media Streaming & Proxy Endpoints
          </h2>
          <p>
            When streaming video or downloading media files, your browser requests streams via authorized proxy handlers (<code>/api/stream</code> and <code>/api/download</code>). These requests process standard HTTP headers (such as Range requests and IP addresses) strictly for video delivery, bandwidth throttling prevention, and manifest segment rewriting. Logs are retained solely for short-term network diagnostic and security maintenance purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <EyeOff size={18} className="text-[#88b596]" /> 4. Third-Party Content Providers
          </h2>
          <p>
            PinFlix connects to authorized media distribution networks, content delivery networks (CDNs), and cloud providers (such as Cloudflare Stream and media proxies). When media segments or thumbnail images load, these providers receive standard technical request telemetry necessary to transmit the digital video stream to your device.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">5. User Rights & Data Deletion</h2>
          <p>
            Because PinFlix stores watch history locally, you maintain complete autonomous control over your viewing records. You do not need to submit formal data erasure requests to remove your watchlist or playback history; simply use the in-app deletion tools or clear browser site data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">6. Updates to this Policy</h2>
          <p>
            We may update our Privacy Policy periodically to reflect technological adjustments or legal compliance requirements. Continued use of the platform constitutes acceptance of updated practices.
          </p>
        </section>

        <section className="pt-6 border-t border-white/10">
          <h2 className="text-base font-bold text-white mb-1">Contact Information</h2>
          <p className="text-xs text-white/60">
            If you have questions regarding this Privacy Policy, please email <a href="mailto:privacy@pinflix.tv" className="text-[#88b596] hover:underline">privacy@pinflix.tv</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
