import { z } from "node_modules/zod/lib";
import { protectedProcedure } from "../../trpc";

export const createStation = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      description: z.string(),
      thumbnail: z.string(),
      tags: z.array(z.string()),
      videos: z.array(z.string()),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const station = await ctx.db.station.create({
      data: {
        name: input.name,
        description: input.description,
        thumbnail: input.thumbnail,
        userId: ctx.user.id,
        tags: {
          connect: input.tags.map((tag) => ({ id: tag })),
        },
        videos: {
          createMany: {
            data: input.videos.map((video) => ({ videoId: video, userId: ctx.user.id })),
          },
        },
      },
    });

    return station;
  });
