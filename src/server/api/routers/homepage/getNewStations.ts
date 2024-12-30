import { getCurrentTimeForScheduleItems } from "@/server/services/time";
import { publicProcedure } from "../../trpc";

export const getNewStations = publicProcedure.query(async ({ ctx }) => {
  const { currentTimeInWeek, currentDayOfWeek } = getCurrentTimeForScheduleItems();

  const stations = await ctx.db.station.findMany({
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
                gte: currentTimeInWeek.subtract(1, "hour").toDate(),
                lte: currentTimeInWeek.add(2, "hours").toDate(),
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
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
  });

  return stations;
});
