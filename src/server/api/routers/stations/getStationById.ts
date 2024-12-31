import { z } from "zod";
import { publicProcedure } from "../../trpc";

export const getStationById = publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
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
      followers: {
        where: {
          id: ctx.user?.id ?? "none",
        },
        select: {
          id: true,
        },
      },
      user: {
        select: {
          displayName: true,
          image: true,
        },
      },
      _count: {
        select: {
          followers: true,
        },
      },
    },
  });

  return station;
});
