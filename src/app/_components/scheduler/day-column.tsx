"use client";

import { Reorder } from "framer-motion";
import { Fragment, useState, useEffect } from "react";
import AddVideoButton from "./add-video";
import ScheduleItem from "./schedule-item";
import type { SchedulerItem } from "./scheduler";
import AddVideoAtTimeModal from "./add-video-modal";
import type { Video } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const getGradientColor = (id: string) => {
  if (id === "deadair") return "from-gray-700 to-gray-900";

  const colors = [
    "from-blue-500 to-cyan-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-violet-500",
    "from-emerald-500 to-green-500",
    "from-fuchsia-500 to-pink-500",
    "from-amber-500 to-yellow-500",
    "from-yellow-500 to-orange-500",
    "from-purple-500 to-blue-500",
    "from-rose-500 to-red-500",
    "from-teal-500 to-cyan-500",
  ];
  // Use djb2 hash algorithm for better distribution
  const hash = id.split("").reduce((hash, char) => (hash << 5) + hash + char.charCodeAt(0), 5381);
  return colors[Math.abs(hash) % colors.length]!;
};

type EmptySpace = { duration: number };

const DayColumn = ({ day, dayWidth, hourHeight, items, onUpdate }: { day: string; dayWidth: number; hourHeight: number; items: SchedulerItem[]; onUpdate: (newOrder: SchedulerItem[]) => void }) => {
  const pixelsPerSecond = hourHeight / 3600;
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const [isToday, setIsToday] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = dayjs().utc();
      const currentDay = now.format("dddd");
      setIsToday(currentDay === day);

      // Calculate seconds since midnight UTC
      const secondsSinceMidnight = now.hour() * 3600 + now.minute() * 60 + now.second();
      setCurrentTimePosition(secondsSinceMidnight * pixelsPerSecond);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [day, pixelsPerSecond]);

  const onVideoSelected = (video: Video | EmptySpace) => {
    if (clickedIndex === null) return;

    const newItem = {
      id: uuidv4(),
      image: "thumbnail" in video ? video.thumbnail : undefined,
      title: "title" in video ? video.title : `Dead Air`,
      index: clickedIndex,
      durationInSeconds: video.duration,
      isPartial: false,
      originalDuration: video.duration,
      isMovable: true,
      videoId: "id" in video ? video.id : undefined,
    };

    const newOrder = [...items.slice(0, clickedIndex), newItem, ...items.slice(clickedIndex)] as SchedulerItem[];

    onUpdate(newOrder);
    setClickedIndex(null);
  };

  const handleDelete = (id: string) => {
    const newOrder = items.filter((item) => item.id !== id);
    onUpdate(newOrder);
  };

  return (
    <div className="border-r border-border" style={{ width: `${dayWidth}px`, maxWidth: `${dayWidth}px` }}>
      <div className="text-center p-2 font-medium border-b border-border">{day}</div>
      <div style={{ height: `${24 * hourHeight}px`, position: "relative", overflowY: "hidden" }}>
        {isToday && (
          <div
            className="absolute w-full border-t border-red-500 z-10"
            style={{
              top: `${currentTimePosition}px`,
              borderWidth: "1px",
            }}
          />
        )}
        {items.length === 0 && day === "Sunday" ? (
          <div className="flex w-full">
            <Button variant="default" className=" aspect-square p-2 my-2 mx-auto rounded-full" onClick={() => setClickedIndex(0)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Reorder.Group axis="y" values={items ?? []} onReorder={onUpdate}>
            {items?.map((item, itemIndex) => {
              const startSeconds = items?.slice(0, itemIndex).reduce((acc, curr) => acc + curr.durationInSeconds, 0) ?? 0;
              const endSeconds = startSeconds + item.durationInSeconds;
              const topPosition = startSeconds * pixelsPerSecond;
              const height = item.durationInSeconds * pixelsPerSecond;
              const gradientClass = getGradientColor(item.videoId ?? "deadair");
              return (
                <Fragment key={item.id}>
                  <ScheduleItem item={item} startSeconds={startSeconds} endSeconds={endSeconds} topPosition={topPosition} height={height} gradientClass={gradientClass} onDelete={handleDelete} />
                  {<AddVideoButton topPosition={topPosition} height={height} onClick={() => setClickedIndex(itemIndex + 1)} />}
                </Fragment>
              );
            })}
          </Reorder.Group>
        )}
      </div>
      <AddVideoAtTimeModal isOpen={clickedIndex !== null} onClose={() => setClickedIndex(null)} onVideoSelected={onVideoSelected} />
    </div>
  );
};

export default DayColumn;
