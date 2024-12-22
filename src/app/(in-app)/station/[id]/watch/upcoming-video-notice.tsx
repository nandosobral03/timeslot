"use client";

import Image from "next/image";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import type { Prisma } from "@prisma/client";

dayjs.extend(duration);

interface UpcomingVideoNoticeProps {
  upcomingVideo: Prisma.ScheduleItemGetPayload<{ include: { video: true } }> | null;
}

export default function UpcomingVideoNotice({ upcomingVideo }: UpcomingVideoNoticeProps) {
  if (!upcomingVideo) {
    return null;
  }

  const startTime = dayjs().utc().set("hour", dayjs(upcomingVideo.startTime).utc().hour()).set("minute", dayjs(upcomingVideo.startTime).utc().minute()).set("second", 0);
  const secondsUntilStart = startTime.diff(dayjs().utc(), "second");

  if (secondsUntilStart > 20) {
    return null;
  }
  return (
    <div className="absolute top-0 right-0 w-[32rem] h-32 m-12">
      <div className="bg-background/80 rounded-md p-4 flex gap-4">
        <Image src={upcomingVideo.video?.thumbnail || ""} width={128} height={96} alt="" className="rounded-md" />
        <div className="flex flex-col gap-1 flex-grow">
          <span className="text-primary text-md">Up next:</span>
          <div className="text-foreground text-sm">{upcomingVideo.video?.title || "Untitled"}</div>
          <div className="text-foreground text-sm w-full text-end">until {dayjs().add(upcomingVideo.duration, "second").format("h:mm A")}</div>
        </div>
      </div>
    </div>
  );
}
