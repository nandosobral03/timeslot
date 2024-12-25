import { publicProcedure } from "@/server/api/trpc";

export const getCurrentUser = publicProcedure.query(async ({ ctx }) => {
  if (!ctx.user) return null;

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
