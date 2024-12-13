import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const updateDisplayName = protectedProcedure
  .input(
    z.object({
      displayName: z.string().min(8),
    })
  )
  .mutation(({ input: { displayName }, ctx }) => {
    return ctx.db.user.update({
      where: { id: ctx.user.id },
      data: { displayName },
    });
  });
