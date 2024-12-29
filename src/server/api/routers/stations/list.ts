import { publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { Prisma } from "@prisma/client";

dayjs.extend(utc);

export const listStations = publicProcedure
  .input(
    z.object({
      page: z.number().optional().default(1),
      pageSize: z.number().optional().default(10),
      tags: z.array(z.string()).optional(),
      search: z.string().optional(),
      videoId: z.string().optional(),
      channelId: z.string().optional(),
      sortBy: z.enum(["createdAt", "followersCount"]).optional().default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    })
  )
  .query(async ({ input, ctx }) => {
    const { page = 1, pageSize = 10, tags, search, videoId, channelId, sortBy = "createdAt", sortOrder = "desc" } = input;

    // Get current time
    const now = dayjs().utc();
    const currentDayOfWeek = now.day();

    // Calculate seconds since start of day
    const secondsSinceMidnight = now.hour() * 3600 + now.minute() * 60 + now.second();

    // Calculate the reference time (Unix timestamp 0 + seconds for current time of day)
    const referenceTime = dayjs.unix(0).add(secondsSinceMidnight, "second");
    const twoHoursFromReference = referenceTime.add(2, "hours");

    const where: Prisma.StationWhereInput = {
      tags: {
        every: {
          name: {
            in: tags,
          },
        },
      },
      name: {
        contains: search,
      },
      ...(videoId && {
        scheduleItems: {
          some: {
            videoId: videoId,
          },
        },
      }),
      ...(channelId && {
        videos: {
          some: {
            video: {
              youtubeChannelId: channelId,
            },
          },
        },
      }),
    };

    const [stations, total] = await Promise.all([
      ctx.db.station.findMany({
        where,
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
                    gte: referenceTime.subtract(1, "hour").toDate(), // Include videos that started up to 1 hour ago
                    lte: twoHoursFromReference.toDate(), // Up to 2 hours in the future
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
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      ctx.db.station.count({
        where: {
          tags: {
            every: {
              name: {
                in: tags,
              },
            },
          },
        },
      }),
    ]);

    return { stations, total };
  });
