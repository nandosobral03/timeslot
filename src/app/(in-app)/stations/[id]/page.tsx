import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import StationDetails from "@/app/_components/station/station-details";

dayjs.extend(utc);

interface StationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StationPage({ params }: StationPageProps) {
  const { id } = await params;

  const station = await api.stations.getStationById({ id });

  if (!station) {
    return notFound();
  }

  return <StationDetails station={station} showButtons={["watch", "follow"]} showCurrentSchedule />;
}
