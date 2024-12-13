import { type SessionValidationResult, validateSessionToken } from "@/server/auth/sessions";
import { cookies } from "next/headers";
import { cache } from "react";
import { env } from "@/env";

export async function setSessionTokenCookie(token: string, expiresAt: Date): Promise<void> {
  (await cookies()).set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSessionTokenCookie(): Promise<void> {
  (await cookies()).set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
  const token = (await cookies()).get("session")?.value ?? null;

  if (token === null) {
    return { session: null, user: null };
  }

  return validateSessionToken(token);
});
