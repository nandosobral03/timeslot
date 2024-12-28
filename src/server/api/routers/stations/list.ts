import { publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

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

    const stations = await ctx.db.station.findMany({
      where: {
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
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
    return stations;
  });
