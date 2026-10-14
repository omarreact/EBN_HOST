import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AccountError,
  accountConfigured,
  accountFailure,
  authenticate,
  authRequest,
  clearSession,
  rateLimit,
  sameOrigin,
  sessionCookies,
} from "@/lib/account-server";
const Form = z.object({
  action: z.enum(["signin", "signup", "reset", "profile"]),
  email: z.email().max(254).optional(),
  password: z.string().min(1).max(128).optional(),
  name: z.string().trim().min(1).max(40).optional(),
});
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const session = await authenticate(req);
    const response = NextResponse.json(
      { configured: accountConfigured(), user: session?.user || null },
      { headers: { "Cache-Control": "no-store" } },
    );
    if (session?.renewed)
      return sessionCookies(
        response,
        req,
        session.idToken,
        session.refreshToken,
      );
    return response;
  } catch (e) {
    return accountFailure(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    sameOrigin(req);
    rateLimit(req);
    const raw = await req.text();
    if (raw.length > 3000)
      throw new AccountError(413, "The request is too large.");
    const parsed = Form.safeParse(JSON.parse(raw));
    if (!parsed.success)
      throw new AccountError(
        400,
        "Enter a valid email and a password of at least eight characters.",
      );
    const { action, email, password, name } = parsed.data;
    if (action === "reset") {
      if (!email) throw new AccountError(400, "Enter your email address.");
      await authRequest("sendOobCode", {
        requestType: "PASSWORD_RESET",
        email,
      }).catch((e) => {
        if (e instanceof AccountError && e.status === 503) throw e;
      });
      return NextResponse.json(
        {
          message:
            "If an account exists, a password reset email will arrive shortly.",
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (action === "profile") {
      const session = await authenticate(req);
      if (!session || !name)
        throw new AccountError(401, "Sign in to update your account.");
      const changed = await authRequest("update", {
        idToken: session.idToken,
        displayName: name,
        returnSecureToken: true,
      });
      return sessionCookies(
        NextResponse.json({ user: { ...session.user, name } }),
        req,
        changed.idToken || session.idToken,
        changed.refreshToken || session.refreshToken,
      );
    }
    if (
      !email ||
      !password ||
      (action === "signup" && (!name || password.length < 8))
    )
      throw new AccountError(400, "Complete all required fields.");
    let result = await authRequest(
      action === "signup" ? "signUp" : "signInWithPassword",
      { email, password, returnSecureToken: true },
    );
    if (action === "signup" && name) {
      const changed = await authRequest("update", {
        idToken: result.idToken,
        displayName: name,
        returnSecureToken: true,
      });
      result = { ...result, ...changed };
    }
    const response = NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } },
    );
    return sessionCookies(response, req, result.idToken, result.refreshToken);
  } catch (e) {
    return accountFailure(e);
  }
}
export async function DELETE(req: NextRequest) {
  try {
    sameOrigin(req);
    return clearSession(
      NextResponse.json(
        { success: true },
        { headers: { "Cache-Control": "no-store" } },
      ),
    );
  } catch (e) {
    return accountFailure(e);
  }
}
