import { db } from "../db";
import { getCategoryName } from "./youtube";

import { durationToSeconds } from "./youtube";

import { YoutubeAPI } from "./youtube";
import type { Prisma } from "@prisma/client";

export const cacheVideoInfo = async (videoId: string) => {
  const videoExists = await db.video.findUnique({ where: { id: videoId } });
  if (videoExists) {
    return videoExists;
  }

  const videoInfo = await YoutubeAPI.videos.list({ id: [videoId], part: ["snippet", "contentDetails", "statistics"] });
  if (videoInfo.data.items?.length === 0)
    throw {
      status: 404,
      message: "Video not found",
    };
  const video = videoInfo.data.items?.[0];
  if (!video) {
    throw {
      status: 404,
      message: "Video not found",
    };
  }
  if (!video.snippet?.title || !video.snippet?.thumbnails?.high?.url || !video.contentDetails?.duration || !video.snippet?.categoryId || !video.snippet?.channelTitle || !video.snippet?.channelId) {
    throw {
      status: 500,
      message: "Missing required video information",
    };
  }
  let insert: Prisma.VideoCreateInput = {
    id: videoId,
    title: video.snippet.title,
    thumbnail: video.snippet.thumbnails.high.url,
    duration: durationToSeconds(video.contentDetails.duration),
    category: getCategoryName(Number(video.snippet.categoryId)),
    youtubeChannel: video.snippet.channelTitle,
    youtubeChannelId: video.snippet.channelId,
  };
  try {
    const video = await db.video.create({ data: insert });

    return video;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw {
        status: 500,
        message: err.message,
      };
    }
    throw err;
  }
};
