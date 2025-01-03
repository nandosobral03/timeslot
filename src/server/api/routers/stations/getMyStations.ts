import { protectedProcedure } from "../../trpc";
import { getCurrentTimeForScheduleItems } from "@/server/services/time";

export const getMyStations = protectedProcedure.query(async ({ ctx }) => {
  const { currentTimeInWeek, currentDayOfWeek } = getCurrentTimeForScheduleItems();

  return await ctx.db.station.findMany({
    where: {
      userId: ctx.user.id,
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
        orderBy: {
          startTime: "asc",
        },
      },
    },
  });
});
