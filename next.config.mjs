const config = {
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["cheerio"],
  async redirects() {
    return [
      {
        source: "/library",
        destination: "/my-list/",
        permanent: true,
      },
    ];
  },
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
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://cineplexbd.net https://cineplexbd.net https://image.tmdb.org https://*.aoneroom.com https://aoneroom.com https://*.hakunaymatata.com; media-src 'self' blob: data: http://cineplexbd.net https://cineplexbd.net http://vod.cineplexbd.net:8081 http://103.136.200.124:8086 http://103.136.200.124:8081 https://*.hakunaymatata.com https://hakunaymatata.com https://*.aoneroom.com https://aoneroom.com https://movibox.net https://*.movibox.net https://commondatastorage.googleapis.com https://test-streams.mux.dev https://*.cloudflarestream.com https://cloudflarestream.com; connect-src 'self' http://cineplexbd.net https://cineplexbd.net http://vod.cineplexbd.net:8081 http://103.136.200.124:8086 http://103.136.200.124:8081 https://*.hakunaymatata.com https://hakunaymatata.com https://*.aoneroom.com https://aoneroom.com https://movibox.net https://*.movibox.net https://commondatastorage.googleapis.com https://test-streams.mux.dev https://*.cloudflarestream.com https://cloudflarestream.com https://image.tmdb.org; worker-src 'self' blob:; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
          },
        ],
      },
    ];
  },
};
export default config;
