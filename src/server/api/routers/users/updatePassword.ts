import { hashPassword } from "@/server/auth/password";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const updatePassword = protectedProcedure
  .input(
    z.object({
      currentPassword: z.string().min(8),
      newPassword: z.string().min(8),
    })
  )
  .mutation(async ({ input: { currentPassword, newPassword }, ctx }) => {
    const hashedOldPassword = await hashPassword(currentPassword);

    const user = await ctx.db.credentialsUser.findUnique({
      where: { userId: ctx.user.id, password: hashedOldPassword },
    });

    if (!user) {
      throw new Error("Invalid current password");
    }

    const hashedPassword = await hashPassword(newPassword);
    return ctx.db.credentialsUser.update({
      where: { userId: ctx.user.id },
      data: { password: hashedPassword },
    });
  });
