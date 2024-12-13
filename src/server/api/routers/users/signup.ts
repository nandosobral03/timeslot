import { publicProcedure } from "@/server/api/trpc";
import { hashPassword } from "@/server/auth/password";
import { z } from "zod";

export const signup = publicProcedure
  .input(
    z.object({
      displayName: z.string().min(8),
      email: z.string().email(),
      password: z.string().min(8),
    })
  )
  .mutation(async ({ input: { password, email, displayName }, ctx }) => {
    const hashedPassword = await hashPassword(password);
    return ctx.db.user.create({
      data: {
        email,
        displayName,
        credentialsUser: {
          create: {
            password: hashedPassword,
          },
        },
      },
    });
  });
