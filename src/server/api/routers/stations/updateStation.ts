import { z } from "node_modules/zod/lib";
import { protectedProcedure } from "../../trpc";

export const updateStation = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      thumbnail: z.string(),
      tags: z.array(z.string()),
      videos: z.array(z.string()),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const station = await ctx.db.station.update({
      where: {
        id: input.id,
      },
      data: {
        name: input.name,
        description: input.description,
        thumbnail: input.thumbnail,
        tags: {
          set: [], // Clear existing tags
          connect: input.tags.map((tag) => ({ id: tag })),
        },
        videos: {
          deleteMany: {}, // Clear existing videos
          createMany: {
            data: input.videos.map((video) => ({ videoId: video, userId: ctx.user.id })),
          },
        },
      },
    });

    return station;
  });
