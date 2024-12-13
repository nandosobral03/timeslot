import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import type { Session, User } from "@prisma/client";
import { db } from "../db";

export function generateSessionToken() {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);

  return encodeBase32LowerCaseNoPadding(bytes);
}

export function createSession(token: string, userId: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), //30 days
  };

  return db.session.create({
    data: session,
  });
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const result = await db.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: true,
    },
  });

  if (result === null) {
    return { session: null, user: null };
  }

  const { user, ...session } = result;

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.session.delete({ where: { id: sessionId } });

    return { session: null, user: null };
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    //Expires in less than 15 days
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); //We add 30 days

    await db.session.update({
      where: {
        id: session.id,
      },
      data: {
        expiresAt: session.expiresAt,
      },
    });
  }

  return { session, user };
}

export async function invalidateSession(id: string) {
  await db.session.delete({ where: { id } });
}

export type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };
