import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getUserById = publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
  const user = await ctx.db.user.findUnique({
    where: {
      id: input,
    },
    include: {
      googleUser: true,
    },
  });

  if (!user) return null;

  const { googleUser, ...rest } = user;

  return {
    ...rest,
    type: googleUser ? "google" : "credentials",
  };
});
