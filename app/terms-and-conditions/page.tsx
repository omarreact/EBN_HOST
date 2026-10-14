import Link from "next/link";
import { FileText, AlertCircle, CheckCircle, Scale } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | PinFlix",
  description: "Terms of service, streaming and download rules, and acceptable use policy for PinFlix.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 sm:px-10 py-16">
      {/* Header */}
      <div className="border-b border-white/10 pb-8 mb-10">
        <p className="text-xs font-semibold tracking-widest text-[#88b596] uppercase mb-2">
          USER AGREEMENT & ACCEPTABLE USE
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3">
          Terms & Conditions
        </h1>
        <p className="text-xs sm:text-sm text-white/50">
          Last Updated: October 2026 • Please read carefully before accessing the service.
        </p>
      </div>

      <div className="space-y-10 text-sm text-[#b2bcae] leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Scale size={18} className="text-[#88b596]" /> 1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using the PinFlix website, video player, content directories, or related APIs, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, do not access or use the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle size={18} className="text-[#88b596]" /> 2. Personal & Non-Commercial Use
          </h2>
          <p>
            PinFlix grants you a limited, non-exclusive, revocable license to view, stream, and temporarily download authorized content strictly for your personal, non-commercial entertainment purposes. You may not re-broadcast, publicly perform, resell, or distribute media streams to third parties without prior written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <AlertCircle size={18} className="text-[#88b596]" /> 3. Intellectual Property & Media Sources
          </h2>
          <p className="mb-2">
            All original graphics, interface designs, brand styling, code, and navigational architectures on PinFlix are protected by intellectual property laws.
          </p>
          <p>
            Promotional banners, film backdrops, video titles, and media streams are owned by their respective copyright holders and studio distributors. PinFlix does not claim ownership over licensed media properties, including Marvel Studios, DC Studios, or external studio productions featured in thematic discovery rails.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">4. Streaming & Download Limitations</h2>
          <ul className="list-disc pl-5 space-y-1 text-white/70">
            <li>Download buttons are provided exclusively for authorized media assets whose distribution sources support caching.</li>
            <li>Users agree not to tamper with rate limiters, proxy tokens, or backend stream routing infrastructures.</li>
            <li>Automated scraping or bulk downloading that harms server availability or degrades quality of service for other users is strictly prohibited.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">5. Disclaimer of Warranties & Availability</h2>
          <p>
            PinFlix is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranty of any kind. While our team aims for 99.9% uptime and low latency, we do not guarantee that playback will be uninterrupted, error-free, or compatible with obsolete browser software.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">6. Termination & Modifications</h2>
          <p>
            We reserve the right to suspend or restrict access to users who violate these acceptable use guidelines or attempt unauthorized access to platform servers.
          </p>
        </section>

        <section className="pt-6 border-t border-white/10">
          <h2 className="text-base font-bold text-white mb-1">Legal Inquiries</h2>
          <p className="text-xs text-white/60">
            For inquiries regarding terms, licensing, or DMCA communications, please contact <a href="mailto:legal@pinflix.tv" className="text-[#88b596] hover:underline">legal@pinflix.tv</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
