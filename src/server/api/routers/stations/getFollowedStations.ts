import { protectedProcedure } from "@/server/api/trpc";
import { getCurrentTimeForScheduleItems } from "@/server/services/time";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { z } from "zod";

dayjs.extend(utc);

export const getFollowedStations = protectedProcedure
  .input(
    z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(15),
      tags: z.array(z.string()),
    })
  )
  .query(async ({ input, ctx }) => {
    const { page, pageSize, tags } = input;
    const offset = (page - 1) * pageSize;

    const { currentTimeInWeek, currentDayOfWeek } = getCurrentTimeForScheduleItems();

    const where = {
      followers: {
        some: {
          id: ctx.user.id,
        },
      },
      ...(tags.length > 0 && {
        tags: {
          some: {
            id: {
              in: tags,
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
        skip: offset,
        take: pageSize,
      }),
      ctx.db.station.count({
        where,
      }),
    ]);

    return { stations, total };
  });
