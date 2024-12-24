import { publicProcedure } from "../../trpc";
import dayjs from "dayjs";
import { z } from "zod";

export const getMessages = publicProcedure
  .input(
    z.object({
      stationId: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const messages = await ctx.db.chatMessage.findMany({
      where: {
        stationId: input.stationId,
        createdAt: {
          gte: dayjs.utc().subtract(1, "hour").toDate(),
        },
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            displayName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return messages;
  });
