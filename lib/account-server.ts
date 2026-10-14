import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
export function accountConfigured() {
  return !!process.env.FIREBASE_API_KEY && !!process.env.FIREBASE_PROJECT_ID;
}
export class AccountError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function sameOrigin(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin)
    throw new AccountError(
      403,
      "This request could not be verified. Refresh and try again.",
    );
}
const attempts = new Map<string, { count: number; until: number }>();
export function rateLimit(req: NextRequest) {
  const key = (req.headers.get("x-forwarded-for") || "local").split(",")[0];
  const now = Date.now();
  const previous = attempts.get(key);
  if (previous && previous.until > now && previous.count >= 12)
    throw new AccountError(
      429,
      "Too many attempts. Please try again in a minute.",
    );
  if (attempts.size > 2000) attempts.clear();
  attempts.set(key, {
    count: previous && previous.until > now ? previous.count + 1 : 1,
    until: previous && previous.until > now ? previous.until : now + 60_000,
  });
}
export async function authRequest(action: string, body: unknown) {
  if (!accountConfigured())
    throw new AccountError(
      503,
      "Account sign-in is not available yet. You can continue with a local profile.",
    );
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${encodeURIComponent(process.env.FIREBASE_API_KEY!)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    },
  );
  const result = await response.json();
  if (!response.ok) {
    const code = result.error?.message || "";
    throw new AccountError(
      response.status === 429 ? 429 : 400,
      code.includes("EMAIL_EXISTS")
        ? "An account with this email already exists."
        : code.includes("TOO_MANY")
          ? "Too many attempts. Please try again later."
          : action === "signInWithPassword"
            ? "The email or password is incorrect."
            : "The account request could not be completed. Please try again.",
    );
  }
  return result;
}
const FirebaseUserSchema = z.object({
  localId: z.string().min(1),
  email: z.string(),
  displayName: z.string().optional(),
  emailVerified: z.boolean().optional(),
  disabled: z.boolean().optional(),
});
export type Session = {
  user: { uid: string; email: string; name: string; verified: boolean };
  idToken: string;
  refreshToken?: string;
  renewed: boolean;
};
export async function authenticate(req: NextRequest): Promise<Session | null> {
  if (!accountConfigured()) return null;
  let idToken = req.cookies.get("pinflix-id")?.value;
  let refreshToken = req.cookies.get("pinflix-refresh")?.value;
  let renewed = false;
  if (!idToken && !refreshToken) return null;
  let lookup;
  try {
    if (idToken) lookup = await authRequest("lookup", { idToken });
  } catch {}
  if (!lookup && refreshToken) {
    const r = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(process.env.FIREBASE_API_KEY!)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!r.ok) return null;
    const tokens = await r.json();
    idToken = tokens.id_token;
    refreshToken = tokens.refresh_token;
    renewed = true;
    lookup = await authRequest("lookup", { idToken });
  }
  const parsed = FirebaseUserSchema.safeParse(lookup?.users?.[0]);
  if (!parsed.success || parsed.data.disabled || !idToken) return null;
  const u = parsed.data;
  return {
    user: {
      uid: u.localId,
      email: u.email,
      name: u.displayName || u.email.split("@")[0],
      verified: !!u.emailVerified,
    },
    idToken,
    refreshToken,
    renewed,
  };
}
export function sessionCookies(
  response: NextResponse,
  req: NextRequest,
  idToken: string,
  refreshToken?: string,
) {
  const settings = {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production" &&
      req.nextUrl.protocol === "https:",
    sameSite: "lax" as const,
    path: "/",
  };
  response.cookies.set("pinflix-id", idToken, { ...settings, maxAge: 3500 });
  if (refreshToken)
    response.cookies.set("pinflix-refresh", refreshToken, {
      ...settings,
      maxAge: 30 * 24 * 60 * 60,
    });
  return response;
}
export function clearSession(response: NextResponse) {
  response.cookies.set("pinflix-id", "", { maxAge: 0, path: "/" });
  response.cookies.set("pinflix-refresh", "", { maxAge: 0, path: "/" });
  return response;
}
export function accountFailure(error: unknown) {
  return NextResponse.json(
    {
      error:
        error instanceof AccountError
          ? error.message
          : "The account service could not be reached. Please try again.",
    },
    {
      status: error instanceof AccountError ? error.status : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
