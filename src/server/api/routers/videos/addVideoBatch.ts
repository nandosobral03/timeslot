import { cacheVideoInfo } from "@/server/services/video";
import { protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { getVideoIdFromUrl } from "@/server/services/youtube";
import type { Video } from "@prisma/client";

export const addVideoBatch = protectedProcedure
  .input(
    z.object({
      urls: z.array(z.string()),
    })
  )
  .mutation(async ({ input }) => {
    const successfulVideos: Video[] = [];
    const failedVideos: { videoId: string; error: string }[] = [];

    // Filter valid video URLs, get their IDs and remove duplicates
    const videoIds = [...new Set(input.urls.map((url) => getVideoIdFromUrl(url)).filter((id): id is string => id !== null))];

    // Process videos in batches of 10
    const batchSize = 10;
    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batch = videoIds.slice(i, i + batchSize);
      const results = await Promise.allSettled(batch.map((videoId) => cacheVideoInfo(videoId)));

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successfulVideos.push(result.value);
        } else {
          failedVideos.push({
            videoId: batch[index]!,
            error: result.reason,
          });
        }
      });
    }

    return {
      successfulVideos,
      failedVideos,
    };
  });
