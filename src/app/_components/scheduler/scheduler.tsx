"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectSeparator } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner"; // Import toast from sonner
import DayColumn from "./day-column";
import OrderedView from "./ordered-view";
import TimeColumn from "./time-column";

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

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOUR_HEIGHT = 100;
const DAY_WIDTH = 150;

export default function Scheduler({ items: initialItems, stationId }: SchedulerProps) {
  const [items, setItems] = useState(initialItems);
  const router = useRouter();

  const [isScheduleView, setIsScheduleView] = useState(true);
  const itemsByDay = useMemo(() => getItemsByDay(items), [items]);

  const handleReorder = (newOrder: SchedulerItem[], dayIndex: number) => {
    const updatedItemsByDay = [...itemsByDay];
    updatedItemsByDay[dayIndex] = newOrder;

    const allDAYSNewOrder = updatedItemsByDay
      .flat()
      .map((item) => ({ ...item, durationInSeconds: item.isPartial ? item.originalDuration : item.durationInSeconds }))
      .filter((item) => item.isMovable);
    setItems(allDAYSNewOrder);
  };

  const handleReorderOrderedView = (newOrder: SchedulerItem[]) => {
    setItems(newOrder.map((item) => ({ ...item, durationInSeconds: item.isPartial ? item.originalDuration : item.durationInSeconds })));
  };

  const updateSchedule = api.schedule.updateVideoAtTimeForStation.useMutation();
  const saveSchedule = () => {
    updateSchedule.mutate(
      { stationId, items: items.map((item) => ({ id: item.id, videoId: item.videoId, durationInSeconds: item.durationInSeconds })) },
      {
        onSuccess: () => {
          toast.success("Schedule updated successfully!");
          router.refresh();
        },
        onError: () => {
          toast.error("Failed to update schedule.");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-10">
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>
            Organize your station's video into a schedule that everyone can enjoy at the same time.
            <br /> Schedules are weekly guides for your station based on UTC time. You can see what that time would correspond to in your local time zone by following the red line on the schedule.
            <br />
            <SelectSeparator />
            <div className="text-xs">
              <span className="font-semibold text-primary">Pro Tip:</span> Shorter videos might be hard to handle in the schedule view because of their height, so we recommend using the ordered view.
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-row-reverse gap-2 justify-between">
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Switch id="viewSwitch" checked={isScheduleView} onCheckedChange={(checked) => setIsScheduleView(checked)} />
              <span className="text-sm" style={{ minWidth: "100px" }}>
                {isScheduleView ? "Schedule View" : "Ordered View"}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Button onClick={saveSchedule} disabled={updateSchedule.isPending}>
                {updateSchedule.isPending ? <Loader2 className="animate-spin" /> : "Save"}
              </Button>
              <Button variant="secondary" onClick={() => setItems(initialItems)} disabled={updateSchedule.isPending}>
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {isScheduleView ? (
        <Card className="flex-1 flex relative mx-auto w-full" style={{ maxWidth: `${7 * DAY_WIDTH}px` }}>
          <TimeColumn hourHeight={HOUR_HEIGHT} />
          {DAYS.map((day, dayIndex) => (
            <DayColumn key={day} day={day} dayWidth={DAY_WIDTH} hourHeight={HOUR_HEIGHT} items={itemsByDay[dayIndex] ?? []} onUpdate={(newOrder) => handleReorder(newOrder, dayIndex)} />
          ))}
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ordered View</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderedView items={itemsByDay} onReorder={handleReorderOrderedView} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
