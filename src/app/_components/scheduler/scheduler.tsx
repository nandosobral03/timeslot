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
import ScheduleActions from "./schedule-actions";

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

const splitItemIntoDay = (item: SchedulerProps["items"][0], remainingDuration: number, currentPart: number, isMovable: boolean): SchedulerItem => ({
  ...item,
  durationInSeconds: currentPart,
  isPartial: true,
  originalDuration: remainingDuration,
  isMovable,
});

const addFullDayItem = (item: SchedulerProps["items"][0], originalDuration: number): SchedulerItem => ({
  ...item,
  durationInSeconds: SECONDS_IN_DAY,
  isPartial: true,
  originalDuration,
  isMovable: false,
});

const addRegularItem = (item: SchedulerProps["items"][0]): SchedulerItem => ({
  ...item,
  isMovable: true,
  originalDuration: item.durationInSeconds,
  isPartial: false,
});

const getItemsByDay = (items: SchedulerProps["items"]) => {
  const itemsByDay: SchedulerItem[][] = Array(7)
    .fill(null)
    .map(() => []);

  let secondsSoFar = 0;
  let currentDay = 0;

  for (const item of items) {
    // If item fits in current day
    if (secondsSoFar + item.durationInSeconds <= SECONDS_IN_DAY) {
      if (currentDay >= itemsByDay.length) break;

      itemsByDay[currentDay]!.push(addRegularItem(item));
      secondsSoFar += item.durationInSeconds;
      continue;
    }

    // If item spans multiple days
    let remainingDuration = item.durationInSeconds;
    let currentPart = SECONDS_IN_DAY - secondsSoFar;

    // Add first part to current day
    if (currentDay < itemsByDay.length) {
      itemsByDay[currentDay]!.push(splitItemIntoDay(item, item.durationInSeconds, currentPart, true));
      remainingDuration -= currentPart;
    }

    // Move to next day
    currentDay++;
    secondsSoFar = 0;

    // Handle middle full days
    while (remainingDuration > SECONDS_IN_DAY && currentDay < itemsByDay.length) {
      itemsByDay[currentDay]!.push(addFullDayItem(item, item.durationInSeconds));
      remainingDuration -= SECONDS_IN_DAY;
      currentDay++;
    }

    // Add final part if needed
    if (remainingDuration > 0 && currentDay < itemsByDay.length) {
      itemsByDay[currentDay]!.push(splitItemIntoDay(item, item.durationInSeconds, remainingDuration, false));
      secondsSoFar = remainingDuration;
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
    // Merge consecutive dead items (no video) by combining their durations
    const mergedItems = items.reduce((acc: typeof items, curr) => {
      const lastItem = acc[acc.length - 1];
      if (lastItem && !lastItem.videoId && !curr.videoId) {
        // Merge with previous dead item
        lastItem.durationInSeconds += curr.durationInSeconds;
        return acc;
      }
      acc.push(curr);
      return acc;
    }, []);

    updateSchedule.mutate(
      { stationId, items: mergedItems.map((item) => ({ id: item.id, videoId: item.videoId, durationInSeconds: item.durationInSeconds })) },
      {
        onSuccess: () => {
          toast.success("Schedule updated successfully!");
          setItems(mergedItems);
          router.refresh();
        },
        onError: () => {
          toast.error("Failed to update schedule.");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-4">
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
      <div className="hidden [@media(min-width:1200px)]:block">
        <ScheduleActions items={items} setItems={setItems} stationId={stationId} />

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

      <div className="[@media(min-width:1200px)]:hidden">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">The scheduler is not available on mobile devices. Please use a desktop or tablet with a screen width of at least 1200px.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
