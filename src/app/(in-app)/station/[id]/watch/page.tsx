import { api } from "@/trpc/server";
import VideoPlayer from "./video-player";
import { notFound } from "next/navigation";

export default async function WatchPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const station = await api.stations.getStationById({ id });

  if (!station) {
    return notFound();
  }

  return <VideoPlayer schedule={station.scheduleItems} />;
}
