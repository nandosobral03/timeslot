import { publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const listStations = publicProcedure
  .input(
    z.object({
      // Define any input parameters if needed, e.g., pagination
      page: z.number().optional(),
      pageSize: z.number().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { page = 1, pageSize = 10 } = input;
    const stations = await ctx.db.station.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return stations;
  });
