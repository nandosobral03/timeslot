import { z } from "zod";
import { protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";

export const removeVideoFromStation = protectedProcedure
  .input(
    z.object({
      stationId: z.string(),
      videoId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const station = await db.station.findUnique({ where: { id: input.stationId, userId: ctx.user.id } });
    if (!station) {
      throw new Error("Station not found");
    }

    await db.videoStation.delete({
      where: {
        videoId_stationId: {
          videoId: input.videoId,
          stationId: input.stationId,
        },
        userId: ctx.user.id,
      },
    });
  });
