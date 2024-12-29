import { protectedProcedure } from "../../trpc";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const getMyStations = protectedProcedure.query(async ({ ctx }) => {
  // Get current time
  const now = dayjs().utc();
  const currentDayOfWeek = now.day();

  // Calculate seconds since start of day
  const secondsSinceMidnight = now.hour() * 3600 + now.minute() * 60 + now.second();

  // Calculate the reference time (Unix timestamp 0 + seconds for current time of day)
  const referenceTime = dayjs.unix(0).add(secondsSinceMidnight, "second");
  const twoHoursFromReference = referenceTime.add(2, "hours");

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
                gte: referenceTime.subtract(1, "hour").toDate(),
                lte: twoHoursFromReference.toDate(),
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
