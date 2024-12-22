import { protectedProcedure } from "../../trpc";
import { z } from "zod";

export const getStationById = protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
  const station = await ctx.db.station.findUnique({
    where: {
      id: input.id,
    },
    include: {
      videos: {
        include: {
          video: true,
        },
      },
      scheduleItems: {
        include: {
          video: true,
        },
      },
      tags: true,
    },
  });

  return station;
});
