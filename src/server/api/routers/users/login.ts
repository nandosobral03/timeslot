import { setSessionTokenCookie } from "@/server/auth/cookies";
import { publicProcedure } from "@/server/api/trpc";
import { validatePassword } from "@/server/auth/password";
import { createSession, generateSessionToken } from "@/server/auth/sessions";
import { z } from "zod";

export const login = publicProcedure
  .input(
    z.object({
      password: z.string(),
      email: z.string(),
    })
  )
  .mutation(async ({ input: { password, email }, ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        email,
      },
      include: {
        credentialsUser: true,
      },
    });

    if (!user || !user.credentialsUser) {
      throw new Error("User not found");
    }

    const valid = await validatePassword(user.credentialsUser.password, password);

    if (!valid) {
      throw new Error("User not found"); //TODO: Custom errors?
    }

    const token = generateSessionToken();
    const session = await createSession(token, user.id);
    await setSessionTokenCookie(token, session.expiresAt);

    return {
      user,
    };
  });
