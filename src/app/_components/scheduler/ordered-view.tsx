"use client";

import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";
import type { Video } from "@prisma/client";
import { Reorder } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import AddVideoButton from "./add-video";
import AddVideoAtTimeModal from "./add-video-modal";
import type { SchedulerItem } from "./scheduler";

type OrderedViewProps = {
  items: SchedulerItem[][];
  onReorder: (newOrder: SchedulerItem[]) => void;
};

const SECONDS_IN_DAY = 24 * 60 * 60;

const OrderedView = ({ items, onReorder }: OrderedViewProps) => {
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  const itemsByDayWithSecondsStart = items.map((dayItems, dayIndex) => {
    let accumulatedSeconds = 0;
    return dayItems
      .filter((item) => item.isMovable)
      .map((item) => {
        const startSeconds = accumulatedSeconds;
        const endSeconds = startSeconds + item.originalDuration;
        accumulatedSeconds += item.originalDuration;
        return { ...item, startSeconds, endSeconds, dayIndex };
      });
  });

  const flatItems = itemsByDayWithSecondsStart.flat().filter((item) => item.isMovable);

  const onVideoSelected = (video: Video | { duration: number }) => {
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

    const newOrder = [...flatItems.slice(0, clickedIndex), newItem, ...flatItems.slice(clickedIndex)];
    onReorder(newOrder);
    setClickedIndex(null);
  };

  return (
    <>
      <Reorder.Group axis="y" values={flatItems} onReorder={onReorder} className="flex flex-col items-center gap-2">
        {flatItems.length === 0 ? (
          <Button variant="default" className="aspect-square p-2 my-2 rounded-full" onClick={() => setClickedIndex(0)}>
            <Plus className="w-4 h-4" />
          </Button>
        ) : (
          flatItems.map((item, index) => (
            <Reorder.Item
              value={item}
              className="flex flex-col md:flex-row items-center justify-center border border-secondary rounded-md shadow-sm mb-1 w-full max-w-sm gap-2 md:items-stretch md:min-h-24 hover:bg-primary cursor-grab relative"
              key={item.id}
            >
              <img src={item.image} alt={item.title} className="w-full object-cover rounded-t-md md:rounded-l-md aspect-video pointer-events-none md:w-fit md:h-24" />
              <div className="px-2 w-full pb-2 flex flex-col pr-10">
                <h4 className="text-xs font-semibold md:mt-auto">{item.title}</h4>
                <p className="text-xs text-end mt-auto text-muted-foreground">
                  {formatTime(item.startSeconds)} - <span className={`${item.startSeconds + item.originalDuration > SECONDS_IN_DAY ? "text-secondary" : ""}`}>{formatTime((item.startSeconds + item.originalDuration) % SECONDS_IN_DAY)}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  const newItems = flatItems.filter((i) => i.id !== item.id);
                  onReorder(newItems);
                }}
                className="shrink-0 p-1 hover:bg-gray-100 rounded-full absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </button>
              <AddVideoButton topPosition={0} height={0} onClick={() => setClickedIndex(index)} />
            </Reorder.Item>
          ))
        )}
      </Reorder.Group>
      <AddVideoAtTimeModal isOpen={clickedIndex !== null} onClose={() => setClickedIndex(null)} onVideoSelected={onVideoSelected} />
    </>
  );
};

export default OrderedView;
