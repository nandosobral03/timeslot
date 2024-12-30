import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { RouterOutputs } from "@/trpc/react";
import { Users, Globe, Lock } from "lucide-react";
import Pill from "../common/pill";

dayjs.extend(utc);

type Station = RouterOutputs["stations"]["listStations"]["stations"][number];

interface StationCardProps {
  id: string;
  name: string;
  thumbnail: string;
  tags: { id: string; name: string }[];
  followersCount: number;
  scheduleItems: Station["scheduleItems"];
  isPublic?: boolean;
  shouldShowIfIsPublic?: boolean;
  url?: string;
}

const StationCard = ({ id, name, thumbnail, tags, followersCount, scheduleItems, isPublic = true, shouldShowIfIsPublic = false, url }: StationCardProps) => {
  // Calculate current video
  const now = dayjs().utc();
  const currentScheduleItem = scheduleItems.find((item) => {
    if (item.dayOfWeek === now.day()) {
      const startTime = dayjs.utc().set("hour", dayjs.utc(item.startTime).hour()).set("minute", dayjs.utc(item.startTime).minute()).set("second", 0);
      const endTime = startTime.add(item.duration, "second");

      return now.isAfter(startTime) && now.isBefore(endTime);
    }
    return false;
  });

  return (
    <Link href={url ?? `/stations/${id}`}>
      <div className="group relative overflow-hidden rounded-sm border bg-card transition-all duration-200 hover:shadow-lg border-primary border-2">
        <div className="aspect-video w-full overflow-hidden">
          <Image src={thumbnail} alt={name} width={400} height={225} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">{name}</h2>
            {shouldShowIfIsPublic && (isPublic ? <Globe className="h-4 w-4 text-muted-foreground" /> : <Lock className="h-4 w-4 text-muted-foreground" />)}
          </div>

          <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{followersCount}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <Pill key={tag.id}>{tag.name}</Pill>
            ))}
          </div>

          {currentScheduleItem?.video && (
            <>
              <div className="my-4 border-t border-primary" />
              <div className="rounded-lg bg-muted/50 p-2">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-20 flex-shrink-0 overflow-hidden rounded-md">
                    <Image src={currentScheduleItem.video.thumbnail} alt={currentScheduleItem.video.title} width={80} height={48} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-xs font-medium text-muted-foreground">Now Playing</span>
                    <span className="truncate text-sm">{currentScheduleItem.video.title}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default StationCard;
