"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
import type { Prisma } from "@prisma/client";
import UpcomingVideoNotice from "./upcoming-video-notice";
import SleepControl from "@/app/_components/common/sleep-control";

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
  const [showVideo, setShowVideo] = useState(true);
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

  const onSleep = useCallback(() => {
    setShowVideo(false);
  }, []);

  const onWake = useCallback(() => {
    setShowVideo(true);
  }, []);

  if (!currentVideo?.videoId || !schedule.length) {
    return (
      <div className="w-full h-full flex items-center justify-center ">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-24 h-24 mx-auto">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-muted-foreground">
                <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-muted-foreground">NO SIGNAL</h2>
          <p className="text-muted-foreground text-sm">
            No videos scheduled to play at this time, the next time slot starts at {dayjs(upcomingSchedule[1]?.startTime).format("HH:mm")} with "{upcomingSchedule[1]?.video?.title}"
          </p>
        </div>
      </div>
    );
  }

  const startTime = dayjs().utc().set("hour", dayjs(currentVideo.startTime).utc().hour()).set("minute", dayjs(currentVideo.startTime).utc().minute()).set("second", 0);
  const timeSinceVideoStarted = dayjs().utc().diff(startTime, "second");

  const currentVideoUrl = `https://www.youtube.com/embed/${currentVideo.videoId}?start=${timeSinceVideoStarted}&rel=0&controls=1&autoplay=1&mute=0&enablejsapi=1&allowfullscreen=1`;

  return (
    <div className="w-full h-full relative ">
      <SleepControl onSleep={onSleep} onWake={onWake} />
      <UpcomingVideoNotice upcomingVideo={upcomingSchedule[1] ?? null} />
      {showVideo && <iframe ref={frameRef} src={currentVideoUrl} allow="autoplay; encrypted-media; fullscreen" allowFullScreen title="Station stream" className="w-full h-full" suppressHydrationWarning />}
    </div>
  );
}
