import { z } from "zod";
import { protectedProcedure } from "@/server/api/trpc";
import { cacheVideoInfo } from "@/server/services/video";
import { db } from "@/server/db";
import { getPlaylistIdFromUrl, getPlaylistItems, getVideoIdFromUrl } from "@/server/services/youtube";

export const addVideoToStation = protectedProcedure
  .input(
    z.object({
      stationId: z.string(),
      url: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const station = await db.station.findUnique({ where: { id: input.stationId, userId: ctx.user.id } });
    if (!station) {
      throw new Error("Station not found");
    }

    // if its a oyutube video get the id from the url
    const videoId = getVideoIdFromUrl(input.url);
    if (videoId) {
      const video = await cacheVideoInfo(videoId);
      await db.videoStation.create({ data: { videoId: video.id, stationId: input.stationId, userId: ctx.user.id } });
    }

    // if its a youtube playlist get the ids from the url
    const playlistId = getPlaylistIdFromUrl(input.url);
    if (playlistId) {
      const playlistItems = await getPlaylistItems(playlistId);
      for (const videoId of playlistItems) {
        const video = await cacheVideoInfo(videoId);
        await db.videoStation.create({ data: { videoId: video.id, stationId: input.stationId, userId: ctx.user.id } });
      }
    }
  });
