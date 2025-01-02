import { protectedProcedure } from "../../trpc";

export const getAPIToken = protectedProcedure.query(async ({ ctx }) => {
  const user = await ctx.db.user.findUnique({
    where: { id: ctx.user.id },
  });

  return user?.extensionAPIKey;
});
