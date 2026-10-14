import Link from "next/link";
import {
  ArrowUpRight,
  Bookmark,
  Clapperboard,
  Compass,
  MonitorPlay,
  Subtitles,
  Tv,
} from "lucide-react";
export function AboutPage() {
  return (
    <div className="page-content info-page">
      <header className="info-hero">
        <p className="eyebrow">FOR THE LOVE OF STORIES</p>
        <h1>
          One more story.
          <br />A whole new world.
        </h1>
        <p>
          PinFlix brings movie discovery, television collections, and your
          personal watchlist into one thoughtful experience. Find a story worth
          your time, then make room for the next.
        </p>
      </header>
      <div className="info-grid">
        <article className="info-card">
          <Compass size={28} />
          <h2>Discovery with a little wonder.</h2>
          <p>
            Explore cinematic collections or get straight to the title you want
            with searchable A–Z directories.
          </p>
          <Link href="/movies" className="text-button">
            Explore the collection <ArrowUpRight size={14} />
          </Link>
        </article>
        <article className="info-card">
          <Bookmark size={28} />
          <h2>A place for your favourites.</h2>
          <p>
            Save movies and series for later. Keep track of unfinished stories
            with playback progress stored on your device.
          </p>
          <Link href="/my-list" className="text-button">
            Your little cinema <ArrowUpRight size={14} />
          </Link>
        </article>
        <article className="info-card">
          <MonitorPlay size={28} />
          <h2>Built around the way you watch.</h2>
          <p>
            Movie and episode players live inside their detail pages. Supported
            sources can use fullscreen, theater mode, or a persistent
            mini-player.
          </p>
          <Link href="/services" className="text-button">
            See what’s possible <ArrowUpRight size={14} />
          </Link>
        </article>
      </div>
      <section className="info-wide">
        <p className="eyebrow">LARGE SCREENS. SMALL SCREENS. YOUR SCREEN.</p>
        <h2>Good stories should feel at home everywhere.</h2>
        <p>
          A responsive experience for desktop, tablet, and mobile browsers, with
          touch-friendly navigation, reduced-motion preferences, and keyboard
          controls. Playback features and source availability depend on your
          device and the media supplied.
        </p>
      </section>
      <div className="actions">
        <Link href="/movies" className="primary">
          Find your next story <ArrowUpRight size={16} />
        </Link>
        <Link href="/privacy-policy" className="secondary">
          Your privacy
        </Link>
      </div>
    </div>
  );
}
export function ServicesPage() {
  const services = [
    {
      icon: Clapperboard,
      title: "Movie discovery",
      text: "Cinematic features, curated collections, and a fast text-first directory. Search by title and combine the metadata filters supplied by the catalogue.",
      href: "/movies",
      action: "Browse movies",
    },
    {
      icon: Tv,
      title: "A series to return to",
      text: "Dedicated series pages keep seasons, episode selections, and saved progress together. Streaming is offered only when a usable source is available.",
      href: "/series",
      action: "Browse series",
    },
    {
      icon: Compass,
      title: "Find something great",
      text: "Search the PinFlix collection with title suggestions, recent searches, and keyboard navigation. External metadata is never presented as a playable source.",
      href: "/search",
      action: "Explore search",
    },
    {
      icon: Bookmark,
      title: "Your personal collection",
      text: "Save titles for later, resume unfinished stories, and remove items whenever you want. Guest data stays on this device; optional account sync requires sign-in.",
      href: "/my-list",
      action: "Open My List",
    },
    {
      icon: MonitorPlay,
      title: "Watch your way",
      text: "Available MP4 and HLS streams use in-page playback, fullscreen, picture-in-picture where supported, theater mode, and a mini-player that can continue across routes.",
      href: "/profile",
      action: "Your preferences",
    },
    {
      icon: Subtitles,
      title: "A more thoughtful experience",
      text: "Choose reduced motion, preferred captions, and data-saving playback. Quality, audio tracks, and captions appear only when the source supplies them.",
      href: "/profile",
      action: "Make it yours",
    },
  ];
  return (
    <div className="page-content info-page">
      <header className="info-hero">
        <p className="eyebrow">THE PINFLIX EXPERIENCE</p>
        <h1>
          Discover more.
          <br />
          Watch your way.
        </h1>
        <p>
          Useful features, thoughtfully brought together. From the first search
          to the next episode, your story stays at the centre.
        </p>
      </header>
      <div className="info-grid">
        {services.map((s) => (
          <article key={s.title} className="info-card">
            <s.icon size={27} />
            <h2>{s.title}</h2>
            <p>{s.text}</p>
            <Link href={s.href} className="text-button">
              {s.action} <ArrowUpRight size={14} />
            </Link>
          </article>
        ))}
      </div>
      <section className="info-wide">
        <p className="eyebrow">A NOTE ON AVAILABILITY</p>
        <h2>Every story has its own possibilities.</h2>
        <p>
          A catalogue listing describes a title; it does not promise an active
          stream. Downloads appear only for explicitly approved sources. Sign-in
          and cloud sync appear as available only when the account service is
          connected. We never substitute a different movie for an unavailable
          title.
        </p>
      </section>
    </div>
  );
}
type LegalSection = { id: string; title: string; text: string[] };
const privacy: LegalSection[] = [
  {
    id: "your-data",
    title: "1. Information you choose to share",
    text: [
      "Guest browsing does not require an account. If account sign-in is available and you register, your email, password, and chosen display name are submitted to Firebase Authentication. Passwords are handled by that service and are not stored in your local watchlist.",
    ],
  },
  {
    id: "your-library",
    title: "2. Your list and viewing progress",
    text: [
      "Saved titles, playback positions, episode identities, recent searches, and viewing preferences are stored in your browser’s local storage. Lists and playback history are limited to 200 entries each. Recent searches are limited to six entries.",
      "When you sign in, connecting cloud sync is a separate choice. You can merge your local and account libraries or choose the account library. Connected sync stores your library in a private Firestore document associated with your user ID.",
    ],
  },
  {
    id: "cookies",
    title: "3. Cookies and local storage",
    text: [
      "If you sign in, the service uses HTTP-only session and refresh cookies to maintain your session. Session cookies last about one hour; refresh cookies can last up to 30 days. Signing out clears these cookies on the current browser.",
      "Local data remains until you remove it, clear this device’s library in your profile, or clear your browser’s storage. Shared-device users should sign out and clear personal data after use.",
    ],
  },
  {
    id: "providers",
    title: "4. Hosting and media providers",
    text: [
      "Catalogue, artwork, and media requests may be handled by external providers. These providers receive the network information needed to deliver content, including IP address and browser request headers. Firebase is used only when the account service is configured.",
      "This application does not include third-party advertising or analytics tracking scripts. Hosting and media providers may keep their own operational logs under their respective policies.",
    ],
  },
  {
    id: "security",
    title: "5. Security and retention",
    text: [
      "Account data requests are checked on the server and limited to the signed-in user’s library. Passwords and authentication tokens are not placed in browser-accessible watchlist storage. IP-derived identifiers are held temporarily in server memory to limit repeated requests.",
      "Cloud library data remains while your account library is in use. Clearing the library while sync is connected replaces its saved list and playback history with the empty library. It does not delete your authentication account.",
    ],
  },
  {
    id: "choices",
    title: "6. Your choices",
    text: [
      "You can remove individual saved titles and progress entries, clear recent searches, change preferences, disconnect sync, sign out, or clear your device’s library. Disconnecting sync stops this device from saving changes to the account library; it does not remove data already saved there.",
      "For account deletion or a formal data request, contact the service operator through the support channel provided with your access to PinFlix. No account deletion action is currently offered inside this interface.",
    ],
  },
  {
    id: "changes",
    title: "7. Policy changes",
    text: [
      "This policy describes the features in this application. If data practices change, the policy should be updated before the new practice is introduced. The current hosting provider and service operator’s contact details should be consulted where you access the platform.",
    ],
  },
];
const terms: LegalSection[] = [
  {
    id: "using",
    title: "1. Using PinFlix",
    text: [
      "Use the service for lawful personal discovery and viewing. You must meet applicable age requirements. Restricted collections, where offered, are limited to eligible users.",
    ],
  },
  {
    id: "accounts",
    title: "2. Accounts and shared devices",
    text: [
      "Provide accurate account information, keep your credentials private, and sign out on shared devices. You are responsible for activity performed through your account. Guest watchlists belong to the browser in which they are stored.",
    ],
  },
  {
    id: "availability",
    title: "3. Content availability",
    text: [
      "Listings and artwork describe catalogue titles. A listing does not guarantee that playback, captions, a particular quality, or downloads are available. Access can vary by provider, device, network, and source permissions.",
      "PinFlix may show a previously retrieved catalogue when a provider is unavailable. A playback error is not a guarantee that the same source will become available later.",
    ],
  },
  {
    id: "rights",
    title: "4. Intellectual property and downloads",
    text: [
      "Titles, brands, artwork, and media belong to their respective owners. PinFlix’s curated collections do not imply endorsement or partnership with a studio or franchise.",
      "View or download media only where you have permission. Do not redistribute content, remove access protections, bypass authentication or geographic restrictions, or attempt to defeat DRM. Download availability is separate from streaming availability.",
    ],
  },
  {
    id: "acceptable",
    title: "5. Acceptable use",
    text: [
      "Do not interfere with the service, abuse its request limits, access another person’s private library, submit harmful content, or use the platform to infringe others’ rights. Automated access must respect the provider’s restrictions and the service operator’s rules.",
    ],
  },
  {
    id: "third-parties",
    title: "6. Third-party services",
    text: [
      "Hosting, account services, catalogue data, and media delivery may depend on external services with their own terms and policies. Device support for fullscreen, picture-in-picture, audio tracks, and orientation locking can differ.",
    ],
  },
  {
    id: "changes",
    title: "7. Changes and interruptions",
    text: [
      "Features or access may be changed or suspended when needed to address provider availability, misuse, maintenance, or applicable requirements. No uninterrupted service or particular catalogue size is promised.",
    ],
  },
  {
    id: "contact",
    title: "8. Questions and applicable requirements",
    text: [
      "For service, account, or rights questions, contact the operator through the support channel provided with your access to PinFlix. These terms do not select a particular jurisdiction or override rights or obligations that apply under the law governing your use.",
    ],
  },
];
export function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const sections = kind === "privacy" ? privacy : terms;
  return (
    <div className="page-content info-page">
      <header className="info-hero">
        <p className="eyebrow">THE DETAILS THAT MATTER</p>
        <h1>
          {kind === "privacy"
            ? "Your privacy matters."
            : "A few things to know."}
        </h1>
        <p>
          {kind === "privacy"
            ? "A clear look at your information, your library, and your choices."
            : "How to use PinFlix, what to expect, and how we respect the stories we share."}
        </p>
        <div className="legal-updated">
          {kind === "privacy" ? "Privacy Policy" : "Terms & Conditions"} ·
          Updated October 14, 2026
        </div>
      </header>
      <div className="legal-layout">
        <nav className="legal-toc" aria-label="On this page">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.title}
            </a>
          ))}
        </nav>
        <div className="legal-body">
          {sections.map((s) => (
            <section key={s.id} id={s.id}>
              <h2>{s.title}</h2>
              {s.text.map((p, i) => (
                <p key={i} style={{ marginTop: i ? 14 : 0 }}>
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
