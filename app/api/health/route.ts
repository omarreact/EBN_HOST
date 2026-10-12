// Lightweight platform health check; it does not assert upstream playback availability.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      ok: true,
      service: "PinFlix",
      commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
      environment: process.env.VERCEL_ENV || "local",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
