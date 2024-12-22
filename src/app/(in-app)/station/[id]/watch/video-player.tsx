"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
import type { Prisma } from "@prisma/client";
import Intermission from "./intermission";
import UpcomingVideoNotice from "./upcoming-video-notice";

dayjs.extend(utc);
dayjs.extend(duration);
interface WatchPageProps {
  schedule: Prisma.ScheduleItemGetPayload<{
    include: {
      video: true;
    };
  }>[];
}

const getCurrentVideoIndex = (schedule: Prisma.ScheduleItemGetPayload<{ include: { video: true } }>[], now: dayjs.Dayjs) => {
  const firstDayOfWeek = now.utc().startOf("week");
  const timeSinceWeekStart = now.utc().diff(firstDayOfWeek, "second");
  let secondsAlreadyPlayed = 0;
  let i = 0;
  while (secondsAlreadyPlayed < timeSinceWeekStart) {
    const item = schedule[i];
    if (item) {
      secondsAlreadyPlayed += item.duration;
      if (secondsAlreadyPlayed >= timeSinceWeekStart) {
        return i - 1;
      }
    } else {
      break;
    }
    i++;
  }

  return 0;
};

export default function WatchPage({ schedule }: WatchPageProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(getCurrentVideoIndex(schedule, dayjs().utc()));

  const upcomingSchedule = useMemo(() => {
    return schedule.filter((_item, i) => i > currentVideoIndex);
  }, [schedule, currentVideoIndex]);

  const currentVideo = upcomingSchedule[0];

  useEffect(() => {
    const interval = setInterval(() => {
      const index = getCurrentVideoIndex(schedule, dayjs().utc());
      if (index !== currentVideoIndex) {
        setCurrentVideoIndex(index);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [schedule, currentVideoIndex]);

  console.log(upcomingSchedule);
  if (!currentVideo) {
    return <Intermission />;
  }

  const startTime = dayjs().utc().set("hour", dayjs(currentVideo.startTime).utc().hour()).set("minute", dayjs(currentVideo.startTime).utc().minute()).set("second", 0);
  const timeSinceVideoStarted = dayjs().utc().diff(startTime, "second");

  const currentVideoUrl = `https://www.youtube.com/embed/${currentVideo.videoId}?start=${timeSinceVideoStarted}&rel=0&controls=1&autoplay=1&mute=0&enablejsapi=1&allowfullscreen=1`;

  return (
    <div className="w-full h-full relative">
      <iframe ref={frameRef} src={currentVideoUrl} allow="autoplay; encrypted-media; fullscreen" allowFullScreen title="Station stream" className="w-full h-full" suppressHydrationWarning />

      <UpcomingVideoNotice upcomingVideo={upcomingSchedule[1] ?? null} />
    </div>
  );
}
