import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { Prisma } from "@prisma/client";

dayjs.extend(utc);
dayjs.extend(timezone);

export const updateVideoAtTimeForStation = protectedProcedure
  .input(
    z.object({
      stationId: z.string(),
      items: z.array(
        z.object({
          id: z.string(),
          videoId: z.string().optional(),
          durationInSeconds: z.number(),
        })
      ),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { items } = input;

    let secondsSoFar = 0;

    const station = await ctx.db.station.findUnique({
      where: {
        id: input.stationId,
        userId: ctx.user.id,
      },
    });

    if (!station) {
      throw new Error("Station not found");
    }

    const createData: Prisma.ScheduleItemCreateManyInput[] = [];

    for (const item of items) {
      const startSeconds = secondsSoFar;
      const dayOfWeek = Math.floor(secondsSoFar / 86400);
      const startTime = dayjs.unix(0).add(startSeconds, "second").toDate();

      createData.push({
        dayOfWeek,
        startTime,
        stationId: input.stationId,
        videoId: item.videoId ?? undefined,
        duration: item.durationInSeconds,
      });

      secondsSoFar += item.durationInSeconds;
    }

    await ctx.db.scheduleItem.deleteMany({
      where: {
        stationId: input.stationId,
        station: {
          userId: ctx.user.id,
        },
      },
    });

    await ctx.db.scheduleItem.createMany({
      data: createData,
    });
  });
