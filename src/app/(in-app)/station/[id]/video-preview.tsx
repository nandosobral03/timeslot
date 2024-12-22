"use client";

import Image from "next/image";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useEffect, useState } from "react";

dayjs.extend(utc);

interface VideoPreviewProps {
  video?: {
    thumbnail: string;
    title: string;
    duration: number;
  };
  startTime: Date;
  now?: number;
  duration?: number;
  type: "now" | "next";
}

function VideoPreview({ video, startTime, now, duration, type }: VideoPreviewProps) {
  const title = type === "now" ? "Now Playing" : "Up Next";
  const timeLabel = type === "now" ? "Started at" : "Starts at";
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      if (type === "now" && now && duration) {
        const nowDayjs = dayjs.utc(now);
        const startTimeObj = dayjs.utc().set("hour", dayjs.utc(startTime).hour()).set("minute", dayjs.utc(startTime).minute()).set("second", 0);
        const elapsed = nowDayjs.diff(startTimeObj, "second");
        setProgressPercentage(Math.min((elapsed / duration) * 100, 100));
      }
    };

    calculateProgress();
    if (type === "now") {
      const interval = setInterval(calculateProgress, 1000);

      return () => clearInterval(interval);
    }
  }, [type, now, duration, startTime]);

  return (
    <div>
      <h3 className="font-medium">{title}</h3>
      {video ? (
        <div className="relative px-2">
          {type === "now" && <div className="absolute inset-0 bg-secondary/30" style={{ width: `${progressPercentage}%` }}></div>}
          <div className="flex items-center gap-2 relative">
            <div className="my-2 max-w-[90px] shrink-0">
              <Image src={video.thumbnail} alt={video.title} width={120} height={67} className="rounded bg-white aspect-video object-cover" />
            </div>
            <div>
              <p className="font-medium">{video.title}</p>
              <p className="text-sm text-muted-foreground">
                {timeLabel} {dayjs(startTime).utc().format("HH:mm")}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative px-2">
          {type === "now" && <div className="absolute inset-0 bg-secondary/30" style={{ width: `${progressPercentage}%` }}></div>}
          <div className="flex items-center gap-2 relative">
            <div className="my-auto w-[120px]">
              <div className="h-[67px] w-[120px] bg-secondary rounded"></div>
            </div>
            <div>
              <p className="font-medium">Intermission</p>
              <p className="text-sm text-muted-foreground">
                {timeLabel} {dayjs(startTime).utc().format("HH:mm")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPreview;
