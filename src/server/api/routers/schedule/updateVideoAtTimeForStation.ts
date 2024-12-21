import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const updateVideoAtTimeForStation = protectedProcedure
  .input(
    z.object({
      scheduleItemId: z.string(),
      start: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { scheduleItemId, start } = input;

    const scheduleItem = await ctx.db.scheduleItem.findUnique({
      where: { id: scheduleItemId, station: { userId: ctx.user.id } },
    });

    if (!scheduleItem) {
      throw new Error("Schedule item not found");
    }

    // Convert time from user's timezone to UTC
    const startTime = dayjs(start);
    const utcTime = startTime.utc();
    const utcDay = utcTime.day();
    const utcHours = utcTime.hour();
    const utcMinutes = utcTime.minute();

    const hourInUtcDay0 = dayjs.unix(0).utc().hour(utcHours).minute(utcMinutes).toDate();
    const adjustedDay = utcDay;

    const updatedScheduleItem = await ctx.db.scheduleItem.update({
      where: { id: scheduleItemId },
      data: {
        dayOfWeek: adjustedDay,
        startTime: hourInUtcDay0,
      },
    });

    return updatedScheduleItem;
  });
