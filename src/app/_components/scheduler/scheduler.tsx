"use client";

import { useState, useMemo } from "react";
import TimeColumn from "./time-column";
import DayColumn from "./day-column";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type SchedulerProps = {
  items: {
    id: string;
    image?: string;
    title?: string;
    index: number;
    durationInSeconds: number;
    videoId?: string;
  }[];
  stationId: string;
};

export type SchedulerItem = { id: string; image?: string; title?: string; index: number; durationInSeconds: number; isPartial: boolean; originalDuration: number; isMovable: boolean; videoId?: string };
const SECONDS_IN_DAY = 24 * 60 * 60;

const getItemsByDay = (items: SchedulerProps["items"]) => {
  const itemsByDay: SchedulerItem[][] = Array(7)
    .fill(null)
    .map(() => []);

  let secondsSoFar = 0;
  let currentDay = 0;

  for (const item of items) {
    if (secondsSoFar + item.durationInSeconds <= SECONDS_IN_DAY) {
      itemsByDay[currentDay]!.push({
        ...item,
        isMovable: true,
        originalDuration: item.durationInSeconds,
        isPartial: false,
      });
      secondsSoFar += item.durationInSeconds;
      continue;
    }

    if (secondsSoFar + item.durationInSeconds > SECONDS_IN_DAY) {
      // divide in 2 parts
      const firstPart = SECONDS_IN_DAY - secondsSoFar;
      const secondPart = item.durationInSeconds - firstPart;

      itemsByDay[currentDay]!.push({
        ...item,
        durationInSeconds: firstPart,
        isPartial: true,
        originalDuration: item.durationInSeconds,
        isMovable: true,
      });
      itemsByDay[currentDay + 1]!.push({
        ...item,
        durationInSeconds: secondPart,
        isPartial: true,
        originalDuration: item.durationInSeconds,
        isMovable: false,
      });

      secondsSoFar = secondPart;
      currentDay++;
    }
  }
  return itemsByDay;
};

export default function Scheduler({ items: initialItems, stationId }: SchedulerProps) {
  const [items, setItems] = useState(initialItems);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const router = useRouter();
  const hourHeight = 100;
  const dayWidth = 200;

  const itemsByDay = useMemo(() => getItemsByDay(items), [items]);

  const handleReorder = (newOrder: SchedulerItem[], dayIndex: number) => {
    const updatedItemsByDay = [...itemsByDay];
    updatedItemsByDay[dayIndex] = newOrder;

    const allDaysNewOrder = updatedItemsByDay
      .flat()
      .map((item) => ({ ...item, durationInSeconds: item.isPartial ? item.originalDuration : item.durationInSeconds }))
      .filter((item) => item.isMovable);
    setItems(allDaysNewOrder);
  };

  const updateSchedule = api.schedule.updateVideoAtTimeForStation.useMutation();
  const saveSchedule = () => {
    updateSchedule.mutate(
      { stationId, items: items.map((item) => ({ id: item.id, videoId: item.videoId, durationInSeconds: item.durationInSeconds })) },
      {
        onSuccess: () => {
          router.refresh();
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-10">
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>Organize your station's video into a schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={saveSchedule} disabled={updateSchedule.isPending}>
              {updateSchedule.isPending ? <Loader2 className="animate-spin" /> : "Save"}
            </Button>
            <Button variant="secondary" onClick={() => setItems(initialItems)} disabled={updateSchedule.isPending}>
              Cancel
            </Button>
          </div>
          {updateSchedule.isError && <p className="text-sm text-destructive mt-2">Error saving schedule. Please try again.</p>}
          {updateSchedule.isSuccess && <p className="text-sm text-secondary mt-2">Schedule saved successfully!</p>}
        </CardContent>
      </Card>
      <Card className="flex-1 flex relative mx-auto w-full" style={{ maxWidth: `${7 * dayWidth}px` }}>
        <TimeColumn hourHeight={hourHeight} />
        {days.map((day, dayIndex) => (
          <DayColumn key={day} day={day} dayWidth={dayWidth} hourHeight={hourHeight} items={itemsByDay[dayIndex] ?? []} onUpdate={(newOrder) => handleReorder(newOrder, dayIndex)} />
        ))}
      </Card>
    </div>
  );
}
