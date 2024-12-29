import { publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { YoutubeAPI } from "@/server/services/youtube";

export const search = publicProcedure.input(z.string()).query(async ({ input }) => {
  if (!input) return { items: [] };

  const response = await YoutubeAPI.search.list({
    part: ["snippet"],
    q: input,
    maxResults: 5,
    type: ["video", "channel"], // Only return videos and channels
  });

  return response.data;
});
