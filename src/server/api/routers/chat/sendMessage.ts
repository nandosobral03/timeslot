import { protectedProcedure } from "../../trpc";
import { z } from "zod";

const messageSchema = z.object({
  stationId: z.string(),
  content: z.string(),
});

export type SendMessageInput = z.infer<typeof messageSchema>;

export const sendMessage = protectedProcedure.input(messageSchema).mutation(async ({ ctx, input }) => {
  const message = await ctx.db.chatMessage.create({
    data: {
      content: input.content,
      stationId: input.stationId,
      userId: ctx.user.id,
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
  });

  return message;
});
