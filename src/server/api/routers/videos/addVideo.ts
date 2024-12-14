import { cacheVideoInfo } from "@/server/services/video";
import { protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { getPlaylistIdFromUrl } from "@/server/services/youtube";
import { getPlaylistItems } from "@/server/services/youtube";
import { getVideoIdFromUrl } from "@/server/services/youtube";
import type { Video } from "@prisma/client";

export const addVideo = protectedProcedure
  .input(
    z.object({
      url: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const successfulVideos: Video[] = [];
    const failedVideos: { videoId: string; error: string }[] = [];

    // if its a youtube video get the id from the url
    const videoId = getVideoIdFromUrl(input.url);
    if (videoId) {
      const video = await cacheVideoInfo(videoId);
      successfulVideos.push(video);
    }

    // if its a youtube playlist get the ids from the url
    const playlistId = getPlaylistIdFromUrl(input.url);
    if (playlistId) {
      const playlistItems = await getPlaylistItems(playlistId);
      const batchSize = 10;
      for (let i = 0; i < playlistItems.length; i += batchSize) {
        const batch = playlistItems.slice(i, i + batchSize);
        const results = await Promise.allSettled(batch.map((videoId) => cacheVideoInfo(videoId)));
        const successfulVideos = results.filter((result): result is PromiseFulfilledResult<Video> => result.status === "fulfilled").map((result) => result.value);
        const failedVideos = results
          .filter((result): result is PromiseRejectedResult => result.status === "rejected")
          .map((result) => ({
            videoId: batch[results.indexOf(result)],
            error: result.reason,
          }));
        successfulVideos.push(...successfulVideos);
        failedVideos.push(...failedVideos);
      }
    }

    return {
      successfulVideos,
      failedVideos,
    };
  });
