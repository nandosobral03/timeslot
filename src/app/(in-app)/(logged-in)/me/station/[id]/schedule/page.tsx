import { db } from "@/server/db";
import Schedule from "./schedule";

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

  const videos = await db.videoStation.findMany({
    where: {
      stationId: id,
    },
    include: {
      video: true,
    },
  });

  return <Schedule items={schedule} videos={videos} stationId={id} />;
}

export default CalendarApp;
