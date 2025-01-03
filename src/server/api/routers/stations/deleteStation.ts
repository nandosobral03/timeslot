import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const deleteStation = protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
  const { id } = input;

  const station = await ctx.db.station.findUnique({ where: { id, userId: ctx.user.id } });
  if (!station) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Station not found" });
  }
  // delete all videos in the station
  await ctx.db.scheduleItem.deleteMany({ where: { stationId: id } });
  await ctx.db.videoStation.deleteMany({ where: { stationId: id } });
  await ctx.db.station.delete({ where: { id } });

  return station;
});
