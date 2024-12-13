import { protectedProcedure } from "@/server/api/trpc";

export const getCurrentUser = protectedProcedure.query(async ({ ctx }) => {
  const user = await ctx.db.user.findUnique({
    where: {
      id: ctx.user.id,
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
