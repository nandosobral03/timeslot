import { z } from "node_modules/zod/lib";
import { protectedProcedure } from "../../trpc";

export const getStationVideos = protectedProcedure.input(z.object({ stationId: z.string() })).query(async ({ ctx, input }) => {
  return await ctx.db.videoStation.findMany({
    where: {
      stationId: input.stationId,
    },
    select: {
      video: true,
    },
  });
});
