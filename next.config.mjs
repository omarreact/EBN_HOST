const config = {
  trailingSlash: false,
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.1.6:3000", "192.168.1.6", "localhost:3000"],
  serverExternalPackages: ["cheerio"],
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
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://cineplexbd.net https://cineplexbd.net https://image.tmdb.org; media-src 'self' blob: http://cineplexbd.net https://cineplexbd.net http://vod.cineplexbd.net:8081 http://103.136.200.124:8086 http://103.136.200.124:8081 https://commondatastorage.googleapis.com https://test-streams.mux.dev https://*.cloudflarestream.com; connect-src 'self' ws: wss: http://cineplexbd.net https://cineplexbd.net http://vod.cineplexbd.net:8081 http://103.136.200.124:8086 http://103.136.200.124:8081 https://commondatastorage.googleapis.com https://test-streams.mux.dev https://*.cloudflarestream.com; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
          },
        ],
      },
    ];
  },
};
export default config;
