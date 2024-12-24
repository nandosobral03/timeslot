import { api } from "@/trpc/server";
import VideoPlayer from "./video-player";
import { notFound } from "next/navigation";
import PageWrapper from "@/app/_components/common/page-wrapper";
import Chat from "@/app/_components/chat/chat";

export default async function WatchPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const station = await api.stations.getStationById({ id });

  if (!station) {
    return notFound();
  }

  return (
    <PageWrapper title={`${station.name} - Watch Now`} showBackArrow fullWidth>
      <div className="flex flex-col md:flex-row gap-4 h-full w-full">
        <VideoPlayer schedule={station.scheduleItems} />
        <Chat stationId={station.id} />
      </div>
    </PageWrapper>
  );
}
