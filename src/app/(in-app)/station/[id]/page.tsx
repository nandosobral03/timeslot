import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

interface StationPageProps {
  params: {
    id: string;
  };
}

interface VideoPreviewProps {
  video?: {
    thumbnail: string;
    title: string;
  };
  startTime: Date;
  progress?: number;
  type: "now" | "next";
}

function VideoPreview({ video, startTime, progress, type }: VideoPreviewProps) {
  const title = type === "now" ? "Now Playing" : "Up Next";
  const timeLabel = type === "now" ? "Started at" : "Starts at";
  return (
    <div>
      <h3 className="font-medium">{title}</h3>
      {video ? (
        <div className="relative px-2">
          {progress !== undefined && <div className="absolute inset-0 bg-secondary/30" style={{ width: `${progress}%` }}></div>}
          <div className="flex items-center gap-2 relative">
            <div className="my-2 max-w-[90px] shrink-0">
              <Image src={video.thumbnail} alt={video.title} width={120} height={67} className="rounded bg-white aspect-video object-cover" />
            </div>
            <div>
              <p className="font-medium">{video.title}</p>
              <p className="text-sm text-muted-foreground">
                {timeLabel} {dayjs(startTime).utc().format("HH:mm")}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative px-2">
          {progress !== undefined && <div className="absolute inset-0 bg-secondary/30" style={{ width: `${progress}%` }}></div>}
          <div className="flex items-center gap-2 relative">
            <div className="my-auto w-[120px]">
              <div className="h-[67px] w-[120px] bg-secondary rounded"></div>
            </div>
            <div>
              <p className="font-medium">Intermission</p>
              <p className="text-sm text-muted-foreground">
                {timeLabel} {dayjs(startTime).utc().format("HH:mm")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default async function StationPage({ params }: StationPageProps) {
  const { id } = await params;

  const station = await api.stations.getStationById({ id });

  if (!station) {
    return notFound();
  }

  // Find current and next schedule items
  const now = dayjs().utc();
  const currentScheduleItem = station.scheduleItems.find((item) => {
    if (item.dayOfWeek === now.day()) {
      const startTime = dayjs.utc().set("hour", dayjs.utc(item.startTime).hour()).set("minute", dayjs.utc(item.startTime).minute()).set("second", 0);
      const endTime = startTime.add(item.duration, "second");

      return now.isAfter(startTime) && now.isBefore(endTime);
    }
    return false;
  });

  const nextScheduleItem = station.scheduleItems.find((item) => {
    if (item.dayOfWeek === now.day()) {
      const startTime = dayjs.utc().set("hour", dayjs.utc(item.startTime).hour()).set("minute", dayjs.utc(item.startTime).minute()).set("second", 0);
      return startTime.isAfter(now);
    }
    return false;
  });

  // Calculate progress percentage if there's a current item
  const progressPercentage = currentScheduleItem
    ? (() => {
        const startTime = dayjs.utc().set("hour", dayjs.utc(currentScheduleItem.startTime).hour()).set("minute", dayjs.utc(currentScheduleItem.startTime).minute()).set("second", 0);
        const elapsed = now.diff(startTime, "second");
        return Math.min((elapsed / currentScheduleItem.duration) * 100, 100);
      })()
    : 0;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{station.name}</CardTitle>
          <CardDescription>{station.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {station.thumbnail && <Image src={station.thumbnail} alt={station.name} width={300} height={169} className="rounded-md bg-white" />}
          <div className="flex flex-wrap gap-2">
            {station.tags?.map((tag) => (
              <span key={tag.id} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm">
                {tag.name}
              </span>
            ))}
          </div>

          <div className="space-y-4">
            {currentScheduleItem && <VideoPreview video={currentScheduleItem.video ?? undefined} startTime={currentScheduleItem.startTime} progress={progressPercentage} type="now" />}

            {nextScheduleItem && <VideoPreview video={nextScheduleItem.video ?? undefined} startTime={nextScheduleItem.startTime} type="next" />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
