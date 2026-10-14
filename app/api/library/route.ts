import { NextRequest, NextResponse } from "next/server";
import {
  AccountError,
  accountFailure,
  authenticate,
  sameOrigin,
  sessionCookies,
} from "@/lib/account-server";
import { LibrarySchema } from "@/lib/library-model";
import { defaultPreferences } from "@/lib/preferences";
export const dynamic = "force-dynamic";
async function sessionFor(req: NextRequest) {
  const session = await authenticate(req);
  if (!session) throw new AccountError(401, "Sign in to sync your library.");
  return session;
}
function url(uid: string) {
  const project = process.env.FIREBASE_PROJECT_ID;
  if (!project || !/^[a-z0-9-]+$/.test(project))
    throw new AccountError(503, "Cloud sync is unavailable.");
  return `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/pinflixUsers/${encodeURIComponent(uid)}`;
}
export async function GET(req: NextRequest) {
  try {
    const session = await sessionFor(req);
    const r = await fetch(url(session.user.uid), {
      headers: { Authorization: `Bearer ${session.idToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok && r.status !== 404)
      throw new AccountError(503, "Your cloud library could not be loaded.");
    const document = r.status === 404 ? null : await r.json();
    const data = document?.fields?.library?.stringValue
      ? LibrarySchema.parse(JSON.parse(document.fields.library.stringValue))
      : { list: [], history: [], preferences: defaultPreferences };
    const response = NextResponse.json(
      { data, revision: document?.updateTime || null },
      { headers: { "Cache-Control": "no-store" } },
    );
    return session.renewed
      ? sessionCookies(response, req, session.idToken, session.refreshToken)
      : response;
  } catch (e) {
    return accountFailure(e);
  }
}
export async function PUT(req: NextRequest) {
  try {
    sameOrigin(req);
    const session = await sessionFor(req);
    const raw = await req.text();
    if (raw.length > 500000)
      throw new AccountError(413, "Your library is too large to sync.");
    const body = JSON.parse(raw);
    const data = LibrarySchema.parse(body.data);
    const p = new URLSearchParams({ "updateMask.fieldPaths": "library" });
    if (body.revision) {
      if (typeof body.revision !== "string" || body.revision.length > 50)
        throw new AccountError(400, "Invalid library version.");
      p.set("currentDocument.updateTime", body.revision);
    } else p.set("currentDocument.exists", "false");
    const r = await fetch(url(session.user.uid) + "?" + p, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: { library: { stringValue: JSON.stringify(data) } },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (r.status === 409 || r.status === 412 || r.status === 400)
      throw new AccountError(
        409,
        "Your library changed on another device. Reconnect to merge the latest version.",
      );
    if (!r.ok)
      throw new AccountError(503, "Your cloud library could not be saved.");
    const result = await r.json();
    const response = NextResponse.json(
      { revision: result.updateTime },
      { headers: { "Cache-Control": "no-store" } },
    );
    return session.renewed
      ? sessionCookies(response, req, session.idToken, session.refreshToken)
      : response;
  } catch (e) {
    return accountFailure(e);
  }
}
