import { fileURLToPath } from "node:url";
const config = {
  basePath: "/ebn-host-live",
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: { cpus: 1 },
  serverExternalPackages: ["cheerio"],
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://cineplexbd.net https://image.tmdb.org; media-src 'self' blob: http://cineplexbd.net http://vod.cineplexbd.net:8081; connect-src 'self' http://cineplexbd.net http://vod.cineplexbd.net:8081; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
          },
        ],
      },
    ];
  },
};
export default config;
