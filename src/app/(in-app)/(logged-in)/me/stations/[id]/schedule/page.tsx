import { db } from "@/server/db";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import isBetween from "dayjs/plugin/isBetween";
import Scheduler from "../../../../../../_components/scheduler/scheduler";
import { formatTime } from "@/lib/utils";
import PageWrapper from "@/app/_components/common/page-wrapper";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

interface CalendarAppProps {
  params: Promise<{
    id: string;
  }>;
}

async function CalendarApp({ params }: CalendarAppProps) {
  const { id } = await params;

  const schedule = await db.scheduleItem.findMany({
    where: {
      stationId: id,
    },
    include: {
      video: true,
    },
  });

  const itemsForScheduler = schedule
    .map((item, index) => ({
      id: item.id,
      image: item.video?.thumbnail,
      title: item.video?.title ?? `Dead Air ${formatTime(item.duration)}`,
      index,
      durationInSeconds: item.duration,
      videoId: item.videoId ?? undefined,
    }))
    .sort((a, b) => a.index - b.index);

  return (
    <PageWrapper title="Schedule" showBackArrow>
      <Scheduler items={itemsForScheduler} stationId={id} />
    </PageWrapper>
  );
}

export default CalendarApp;
