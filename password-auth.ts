import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { env } from "../lib/env";
import { getSessionCookieOptions } from "../lib/cookies";
import { Session, PasswordAdmin } from "@contracts/constants";
import { signSessionToken } from "./session";
import { upsertUser } from "../queries/users";

/**
 * Handles POST /api/admin/password-login
 * A simple alternative to Kimi OAuth: if the submitted password matches
 * ADMIN_PASSWORD, a session cookie is issued for a fixed admin account.
 */
export function createPasswordLoginHandler() {
  return async (c: Context) => {
    if (!env.adminPassword) {
      return c.json(
        { error: "Password login is not enabled on this server." },
        404,
      );
    }

    let body: { password?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid request body." }, 400);
    }

    const password = body?.password ?? "";
    if (!password || password !== env.adminPassword) {
      return c.json({ error: "كلمة المرور غير صحيحة." }, 401);
    }

    await upsertUser({
      unionId: PasswordAdmin.unionId,
      name: "مشرف الموقع",
      role: "admin",
      lastSignInAt: new Date(),
    });

    const token = await signSessionToken({
      unionId: PasswordAdmin.unionId,
      clientId: env.appId || "password-login",
    });

    const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
    setCookie(c, Session.cookieName, token, {
      ...cookieOpts,
      maxAge: Session.maxAgeMs / 1000,
    });

    return c.json({ success: true });
  };
}
