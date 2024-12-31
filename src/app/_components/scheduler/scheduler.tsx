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

      if (currentDay + 1 < itemsByDay.length) {
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
      }

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
  const { data: stationVideos, isFetching, isError } = api.stations.getStationVideos.useQuery({ stationId }, { enabled: !!stationId });

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
      <div className="flex gap-2">
        <Button variant="secondary" disabled={isFetching || isError} onClick={() => fillWithChannelVideos()}>
          Fill Empty Space
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
      </div>

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
