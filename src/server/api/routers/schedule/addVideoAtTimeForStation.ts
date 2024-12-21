import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const addVideoAtTimeForStation = protectedProcedure
  .input(
    z.object({
      stationId: z.string(),
      videoId: z.string(),
      day: z.number(),
      time: z.string(),
      timezone: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { stationId, videoId, day, time, timezone } = input;

    // Check if station exists and belongs to user
    const station = await ctx.db.station.findFirst({
      where: {
        id: stationId,
        userId: ctx.user.id,
      },
    });

    if (!station) {
      throw new Error("Station not found or unauthorized");
    }

    // Check if video exists in station's library
    const videoStation = await ctx.db.videoStation.findFirst({
      where: {
        stationId,
        videoId,
      },
      include: {
        video: true,
      },
    });

    if (!videoStation) {
      throw new Error("Video not found in station's library");
    }
    const [hours, minutes] = time.split(":");
    if (!hours || !minutes) {
      throw new Error("Invalid time format");
    }

    // Convert time from user's timezone to UTC
    const userTime = dayjs().tz(timezone).day(day).hour(parseInt(hours)).minute(parseInt(minutes));
    const utcTime = userTime.utc();
    const utcDay = utcTime.day();
    const utcHours = utcTime.hour();
    const utcMinutes = utcTime.minute();

    const hourInUtcDay0 = dayjs.unix(0).utc().hour(utcHours).minute(utcMinutes).toDate();
    const adjustedDay = utcDay;

    // Create schedule item
    await ctx.db.scheduleItem.create({
      data: {
        stationId,
        videoId,
        dayOfWeek: adjustedDay,
        startTime: hourInUtcDay0,
      },
    });
  });
