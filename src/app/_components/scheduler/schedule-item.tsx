"use client";

import { Reorder } from "framer-motion";
import type { SchedulerItem } from "./scheduler";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { X } from "lucide-react";

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const ScheduleItem = ({
  item,
  startSeconds,
  endSeconds,
  topPosition,
  height,
  gradientClass,
  onDelete,
}: {
  item: SchedulerItem;
  startSeconds: number;
  endSeconds: number;
  topPosition: number;
  height: number;
  gradientClass: string;
  onDelete: (id: string) => void;
}) => {
  const ItemContent = (
    <HoverCard openDelay={250}>
      <HoverCardTrigger asChild>
        <div className={`relative w-full h-full p-2 bg-gradient-to-r ${gradientClass} rounded-md shadow-md ${item.isMovable ? "cursor-move" : "opacity-50"}`}>
          {item.isMovable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="absolute top-1 right-1 p-1 rounded-full hover:bg-black/20 text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <div className="h-full flex flex-col overflow-hidden">
            {height > 20 && <p className="text-sm text-white truncate pr-4">{item.title}</p>}
            <p className="text-xs text-white/80">
              {formatTime(startSeconds)} - {formatTime(endSeconds)}
            </p>
          </div>
        </div>
      </HoverCardTrigger>
      {item.title && item.image && (
        <HoverCardContent className="w-80" side="right">
          <div className="flex flex-col gap-2">
            <img src={item.image} alt={item.title} className="rounded-lg w-full h-40 object-cover" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">{item.title}</h4>
              <p className="text-xs text-muted-foreground">
                {formatTime(startSeconds)} - {formatTime(endSeconds)}
              </p>
            </div>
          </div>
        </HoverCardContent>
      )}
    </HoverCard>
  );

  if (item.isMovable) {
    return (
      <Reorder.Item
        key={item.id}
        value={item}
        dragListener={true}
        initial={false}
        style={{
          position: "absolute",
          top: topPosition,
          width: "100%",
          height,
        }}
        animate={{
          y: 0,
          transition: { duration: 0.3, ease: "easeOut" },
        }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
      >
        {ItemContent}
      </Reorder.Item>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        top: topPosition,
        width: "100%",
        height,
      }}
    >
      {ItemContent}
    </div>
  );
};

export default ScheduleItem;
