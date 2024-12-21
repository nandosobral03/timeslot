"use client";

import dayjs from "dayjs";
import type { Prisma } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import isBetween from "dayjs/plugin/isBetween";
import Scheduler from "../../../../../../_components/scheduler/scheduler";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

interface ScheduleProps {
  items: Prisma.ScheduleItemGetPayload<{ include: { video: true } }>[];
  videos: Prisma.VideoStationGetPayload<{ include: { video: true } }>[];
  stationId: string;
}

export default function Schedule({ items }: ScheduleProps) {
  const utils = api.useUtils();
  const router = useRouter();

  const [itemsForScheduler, _setItemsForScheduler] = useState(
    items
      .map((item, index) => ({
        id: item.id,
        image: item.video.thumbnail,
        title: item.video.title,
        index,
        durationInSeconds: item.video.duration,
      }))
      .sort((a, b) => a.index - b.index)
  );

  const updateVideoAtTimeMutation = api.schedule.updateVideoAtTimeForStation.useMutation();
  const _updateVideoAtTime = (scheduleItemId: string, start: string) => {
    updateVideoAtTimeMutation.mutate(
      { scheduleItemId, start },
      {
        onSuccess: () => {
          utils.schedule.invalidate();
          router.refresh();
        },
      }
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Scheduler items={itemsForScheduler} />
      <div style={{ height: "600px" }}></div>
    </div>
  );
}
