import { ObjectParser } from "@pilcrowjs/object-parser";
import { cookies } from "next/headers";

import { setSessionTokenCookie } from "@/server/auth/cookies";
import { createGoogleUser, getUserByGoogleId, google } from "@/server/auth/oauth";
import { createSession, generateSessionToken } from "@/server/auth/sessions";
import { type OAuth2Tokens, decodeIdToken } from "arctic";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = (await cookies()).get("google_oauth_state")?.value ?? null;
  const codeVerifier = (await cookies()).get("google_code_verifier")?.value ?? null;
  if (code === null || state === null || storedState === null || codeVerifier === null) {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }
  if (state !== storedState) {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch {
    return new Response("Please restart the process.", {
      status: 400,
    });
  }

  const claims = decodeIdToken(tokens.idToken());
  const claimsParser = new ObjectParser(claims);

  const googleId = claimsParser.getString("sub");
  const name = claimsParser.getString("name");
  const picture = claimsParser.getString("picture");
  const email = claimsParser.getString("email");

  const existingUser = await getUserByGoogleId(googleId);
  if (existingUser !== null) {
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, existingUser.id);
    setSessionTokenCookie(sessionToken, session.expiresAt);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  }

  const user = await createGoogleUser(googleId, email, name, picture);
  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  setSessionTokenCookie(sessionToken, session.expiresAt);
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
    },
  });
}
