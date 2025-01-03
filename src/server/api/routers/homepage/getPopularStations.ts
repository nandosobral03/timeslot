import { getCurrentTimeForScheduleItems } from "@/server/services/time";
import { publicProcedure } from "../../trpc";

export const getPopularStations = publicProcedure.query(async ({ ctx }) => {
  const { currentTimeInWeek, currentDayOfWeek } = getCurrentTimeForScheduleItems();

  const stations = await ctx.db.station.findMany({
    where: {
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
    take: 3,
    orderBy: {
      followers: {
        _count: "desc",
      },
    },
  });

  return stations;
});
