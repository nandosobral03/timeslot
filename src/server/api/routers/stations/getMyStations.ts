import { protectedProcedure } from "../../trpc";

export const getMyStations = protectedProcedure.query(async ({ ctx }) => {
  return await ctx.db.station.findMany({
    where: {
      userId: ctx.user.id,
    },
  });
});
