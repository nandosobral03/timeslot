"use client";

import { useState, useMemo } from "react";
import TimeColumn from "./time-column";
import DayColumn from "./day-column";

type SchedulerProps = {
  items: {
    id: string;
    image?: string;
    title?: string;
    index: number;
    durationInSeconds: number;
  }[];
};

export type SchedulerItem = { id: string; image?: string; title?: string; index: number; durationInSeconds: number; isPartial: boolean; originalDuration: number; isMovable: boolean };
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

export default function Scheduler({ items: initialItems }: SchedulerProps) {
  const [items, setItems] = useState(initialItems);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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

  return (
    <div className="flex">
      <div className="flex-1 flex relative" style={{ minWidth: `${days.length * dayWidth}px` }}>
        <TimeColumn hourHeight={hourHeight} />
        {days.map((day, dayIndex) => (
          <DayColumn key={day} day={day} dayWidth={dayWidth} hourHeight={hourHeight} items={itemsByDay[dayIndex] ?? []} onUpdate={(newOrder) => handleReorder(newOrder, dayIndex)} />
        ))}
      </div>
    </div>
  );
}
