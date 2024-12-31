import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { z } from "zod";
import { publicProcedure } from "../../trpc";

dayjs.extend(utc);

export const getUserStations = publicProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
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
