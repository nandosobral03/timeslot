import { env } from "@/env";
import { google } from "googleapis";

const categoryMap: Record<number, string> = {
  2: "Autos & Vehicles",
  1: "Film & Animation",
  10: "Music",
  15: "Pets & Animals",
  17: "Sports",
  18: "Short Movies",
  19: "Travel & Events",
  20: "Gaming",
  21: "Videoblogging",
  22: "People & Blogs",
  23: "Comedy",
  24: "Entertainment",
  25: "News & Politics",
  26: "Howto & Style",
  27: "Education",
  28: "Science & Technology",
  29: "Nonprofits & Activism",
  30: "Movies",
  31: "Anime/Animation",
  32: "Action/Adventure",
  33: "Classics",
  34: "Comedy",
  35: "Documentary",
  36: "Drama",
  37: "Family",
  38: "Foreign",
  39: "Horror",
  40: "Sci-Fi/Fantasy",
  41: "Thriller",
  42: "Shorts",
  43: "Shows",
  44: "Trailers",
};

export const YoutubeAPI = google.youtube({
  version: "v3",
  auth: env.YOUTUBE_API_KEY,
});

export const durationToSeconds = (duration: string) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) {
    return 0;
  }
  const hours = parseInt(match[1]?.replace("H", "") || "0");
  const minutes = parseInt(match[2]?.replace("M", "") || "0");
  const seconds = parseInt(match[3]?.replace("S", "") || "0");
  return hours * 3600 + minutes * 60 + seconds;
};

export const getCategoryName = (id: number) => {
  return categoryMap[id];
};

export const getPlaylistItems = async (playlistId: string) => {
  const playlistItems = await YoutubeAPI.playlistItems.list({ playlistId: playlistId, part: ["contentDetails"], maxResults: 50 });
  return playlistItems.data.items?.map((item) => item.contentDetails?.videoId) as string[];
};

export const getVideoIdFromUrl = (url: string) => {
  const urlObj = new URL(url);
  const videoId = urlObj.searchParams.get("v");
  if (!videoId) {
    return null;
  }
  return videoId;
};

export const getPlaylistIdFromUrl = (url: string) => {
  const urlObj = new URL(url);
  const playlistId = urlObj.searchParams.get("list");
  if (!playlistId) {
    return null;
  }
  return playlistId;
};
