import { publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { Prisma } from "@prisma/client";
import { getCurrentTimeForScheduleItems } from "@/server/services/time";

dayjs.extend(utc);

export const listStations = publicProcedure
  .input(
    z.object({
      page: z.number().optional().default(1),
      pageSize: z.number().optional().default(10),
      tags: z.array(z.string()),
      search: z.string().optional(),
      videoId: z.string().optional(),
      channelId: z.string().optional(),
      sortBy: z.enum(["createdAt", "followersCount"]).optional().default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    })
  )
  .query(async ({ input, ctx }) => {
    const { page = 1, pageSize = 10, tags, search, videoId, channelId, sortBy = "createdAt", sortOrder = "desc" } = input;

    const { currentTimeInWeek, currentDayOfWeek } = getCurrentTimeForScheduleItems();

    const where: Prisma.StationWhereInput = {
      ...(tags.length > 0 && {
        tags: {
          some: {
            id: {
              in: tags,
            },
          },
        },
      }),
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
                    gte: currentTimeInWeek.subtract(1, "hour").toDate(), // Include videos that started up to 1 hour ago
                    lte: currentTimeInWeek.add(2, "hours").toDate(), // Up to 2 hours in the future
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
        where,
      }),
    ]);

    return { stations, total };
  });
