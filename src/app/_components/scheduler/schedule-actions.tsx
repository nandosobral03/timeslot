"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

type ScheduleActionsProps = {
  items: {
    id: string;
    image?: string;
    title?: string;
    index: number;
    durationInSeconds: number;
    videoId?: string;
  }[];
  setItems: (
    items: {
      id: string;
      image?: string;
      title?: string;
      index: number;
      durationInSeconds: number;
      videoId?: string;
    }[]
  ) => void;
  stationId: string;
};
const SECONDS_IN_DAY = 24 * 60 * 60;

export default function ScheduleActions({ items, setItems, stationId }: ScheduleActionsProps) {
  const { data: stationVideos, isFetching, isError } = api.stations.getStationVideos.useQuery({ stationId }, { enabled: !!stationId });

  const fillWithChannelVideos = () => {
    if (isFetching || isError || !stationVideos) return;

    let durationToFill = SECONDS_IN_DAY * 7 - items.reduce((acc, item) => acc + item.durationInSeconds, 0);
    const tempVideos = [...items];

    // Track count of each video
    const videoCount = new Map<string, number>();
    tempVideos.forEach((item) => {
      if (item.videoId) {
        videoCount.set(item.videoId, (videoCount.get(item.videoId) || 0) + 1);
      }
    });

    while (durationToFill > 0) {
      // Sort videos by count (least used first)
      const sortedVideos = [...stationVideos].sort((a, b) => {
        const countA = videoCount.get(a.videoId) || 0;
        const countB = videoCount.get(b.videoId) || 0;
        return countA - countB;
      });

      const nextVideo = sortedVideos[0];
      if (!nextVideo) break;

      durationToFill -= nextVideo.video.duration;
      videoCount.set(nextVideo.videoId, (videoCount.get(nextVideo.videoId) || 0) + 1);

      tempVideos.push({
        ...nextVideo,
        id: crypto.randomUUID(),
        durationInSeconds: nextVideo.video.duration,
        index: items.length,
        image: nextVideo.video.thumbnail,
        title: nextVideo.video.title,
        videoId: nextVideo.videoId,
      });
    }
    setItems(tempVideos);
  };

  const addRandomVideo = () => {
    if (isFetching || isError || !stationVideos) return;
    const randomVideo = stationVideos[Math.floor(Math.random() * stationVideos.length)];
    if (!randomVideo) return;
    setItems([...items, { ...randomVideo, id: crypto.randomUUID(), durationInSeconds: randomVideo.video.duration, index: items.length, image: randomVideo.video.thumbnail, title: randomVideo.video.title, videoId: randomVideo.videoId }]);
  };

  return (
    <div className="flex gap-2">
      <Button variant="secondary" disabled={isFetching || isError} onClick={fillWithChannelVideos}>
        Fill With Videos
      </Button>

      <Button
        variant="secondary"
        onClick={() => {
          const shuffled = [...items]
            .sort(() => Math.random() - 0.5)
            .map((item, index) => ({
              ...item,
              index,
            }));
          setItems(shuffled);
        }}
      >
        Shuffle
      </Button>

      <Button
        variant="secondary"
        onClick={() => {
          const totalDuration = items.reduce((acc, item) => acc + item.durationInSeconds, 0);
          const remainingTime = 7 * 24 * 60 * 60 - totalDuration; // Week in seconds

          if (remainingTime > 0) {
            const deadAir = {
              id: crypto.randomUUID(),
              title: "Dead Air",
              durationInSeconds: remainingTime,
              index: items.length,
              image: undefined,
              videoId: undefined,
            };

            setItems([...items, deadAir]);
          }
        }}
      >
        Fill with Dead Air
      </Button>

      <Button variant="secondary" onClick={() => setItems([])}>
        Clear
      </Button>

      <Button variant="secondary" onClick={addRandomVideo}>
        Add Random Video
      </Button>
    </div>
  );
}
