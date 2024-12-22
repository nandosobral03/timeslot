import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import VideoPreview from "./video-preview";
import Link from "next/link";

dayjs.extend(utc);

interface StationPageProps {
  params: {
    id: string;
  };
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

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{station.name}</CardTitle>
              <CardDescription>{station.description}</CardDescription>
            </div>
            <Button size="lg" asChild>
              <Link href={`/station/${params.id}/watch`}>Watch Now</Link>
            </Button>
          </div>
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
            {currentScheduleItem && <VideoPreview video={currentScheduleItem.video ?? undefined} startTime={currentScheduleItem.startTime} now={now.valueOf()} duration={currentScheduleItem.duration} type="now" />}

            {nextScheduleItem && <VideoPreview video={nextScheduleItem.video ?? undefined} startTime={nextScheduleItem.startTime} type="next" />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
