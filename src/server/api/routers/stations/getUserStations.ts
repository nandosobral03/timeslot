import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { z } from "zod";
import { publicProcedure } from "../../trpc";
import { getCurrentTimeForScheduleItems } from "@/server/services/time";

dayjs.extend(utc);

export const getUserStations = publicProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
  const { currentTimeInWeek, currentDayOfWeek } = getCurrentTimeForScheduleItems();

  return await ctx.db.station.findMany({
    where: {
      userId: input.userId,
      isPublic: true,
    },
    include: {
      tags: true,
      _count: {
        select: { followers: true },
      },
      scheduleItems: {
        where: {
          dayOfWeek: currentDayOfWeek,
          AND: [
            {
              startTime: {
                lte: currentTimeInWeek.add(2, "hours").toDate(),
                gte: currentTimeInWeek.subtract(4, "hours").toDate(),
              },
            },
          ],
        },
        include: {
          video: true,
        },
        take: 5,
        orderBy: {
          startTime: "asc",
        },
      },
    },
  });
});
