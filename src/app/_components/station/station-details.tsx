import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PageWrapper from "@/app/_components/common/page-wrapper";
import type { RouterOutputs } from "@/trpc/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import VideoPreview from "@/app/(in-app)/stations/[id]/video-preview";

dayjs.extend(utc);

interface StationDetailsProps {
  station: NonNullable<RouterOutputs["stations"]["getStationById"]>;
  showButtons: ("edit" | "schedule" | "watch")[];
  showCurrentSchedule?: boolean;
}

export default async function StationDetails({ station, showButtons = [], showCurrentSchedule = false }: StationDetailsProps) {
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

  return (
    <PageWrapper title={station.name} showBackArrow>
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>{station.name}</CardTitle>
            <CardDescription>{station.description}</CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            {showButtons.includes("edit") && (
              <Button variant="default">
                <Link href={`/me/station/${station.id}/edit`}>Edit</Link>
              </Button>
            )}
            {showButtons.includes("schedule") && (
              <Button variant="secondary">
                <Link href={`/me/station/${station.id}/schedule`}>Schedule</Link>
              </Button>
            )}
            {showButtons.includes("watch") && (
              <Button size="lg" asChild>
                <Link href={`/stations/${station.id}/watch`}>Watch Now</Link>
              </Button>
            )}
          </div>
        </CardHeader>
        {showCurrentSchedule ? (
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
              {currentScheduleItem && <VideoPreview video={currentScheduleItem.video ?? undefined} startTime={currentScheduleItem.startTime} now={now.valueOf()} duration={currentScheduleItem.duration} type="now" />}

              {nextScheduleItem && <VideoPreview video={nextScheduleItem.video ?? undefined} startTime={nextScheduleItem.startTime} type="next" />}
            </div>
          </CardContent>
        ) : (
          <CardContent className="flex flex-col gap-4">
            {station.thumbnail && <Image src={station.thumbnail} alt={station.name} width={300} height={169} className="rounded-md" />}
            <div className="flex flex-wrap gap-2">
              {station.tags?.map((tag) => (
                <span key={tag.id} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm">
                  {tag.name}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {station.videos?.map(({ video }) => (
                <div key={video.id} className="relative group">
                  <Image src={video.thumbnail} alt={video.title} width={400} height={225} className="rounded-md w-full object-cover aspect-video" />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-base p-3 text-center line-clamp-2">{video.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </PageWrapper>
  );
}
