import { z } from "node_modules/zod/lib";

import { protectedProcedure } from "../../trpc";

export const toggleFollowStation = protectedProcedure
  .input(
    z.object({
      stationId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { stationId } = input;
    const station = await ctx.db.station.findUnique({ where: { id: stationId } });
    if (!station) {
      throw new Error("Station not found");
    }

    const isFollowing = await ctx.db.station.findFirst({
      where: {
        id: stationId,
        followers: {
          some: {
            id: ctx.user.id,
          },
        },
      },
    });

    if (isFollowing) {
      await ctx.db.station.update({
        where: { id: stationId },
        data: {
          followers: {
            disconnect: {
              id: ctx.user.id,
            },
          },
          followersCount: {
            decrement: 1,
          },
        },
      });
    } else {
      await ctx.db.station.update({
        where: { id: stationId },
        data: {
          followers: {
            connect: {
              id: ctx.user.id,
            },
          },
          followersCount: {
            increment: 1,
          },
        },
      });
    }
  });
