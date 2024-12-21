"use client";

import { Reorder } from "framer-motion";
import { Fragment, useState } from "react";
import AddVideoButton from "./add-video";
import ScheduleItem from "./schedule-item";
import type { SchedulerItem } from "./scheduler";
import AddVideoAtTimeModal from "./add-video-modal";
import type { Video } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const getGradientColor = (id: string) => {
  const colors = ["from-blue-500 to-cyan-500", "from-purple-500 to-pink-500", "from-green-500 to-emerald-500", "from-yellow-500 to-orange-500", "from-red-500 to-rose-500", "from-indigo-500 to-violet-500", "from-teal-500 to-green-500"];
  // Use the string's characters to generate a consistent number
  const sum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length]!;
};

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

type EmptySpace = { id: string; duration: number };

const DayColumn = ({ day, dayWidth, hourHeight, items, onUpdate }: { day: string; dayWidth: number; hourHeight: number; items: SchedulerItem[]; onUpdate: (newOrder: SchedulerItem[]) => void }) => {
  const pixelsPerSecond = hourHeight / 3600;

  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  const onVideoSelected = (video: Video | EmptySpace) => {
    if (clickedIndex === null) return;

    const newItem = {
      id: uuidv4(),
      image: "thumbnail" in video ? video.thumbnail : undefined,
      title: "title" in video ? video.title : `Dead Air ${formatTime(video.duration)}`,
      index: clickedIndex,
      durationInSeconds: video.duration,
      isPartial: false,
      originalDuration: video.duration,
      isMovable: true,
    };
    const newOrder = [...items.slice(0, clickedIndex), newItem, ...items.slice(clickedIndex)];

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
              const gradientClass = getGradientColor(item.id);
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
