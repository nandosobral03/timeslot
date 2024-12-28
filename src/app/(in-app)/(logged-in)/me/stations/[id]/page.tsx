import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import StationDetails from "@/app/_components/station/station-details";

interface StationPageProps {
  params: {
    id: string;
  };
}

export default async function StationPage({ params }: StationPageProps) {
  const { id } = params;

  const station = await api.stations.getStationById({ id });

  if (!station) {
    return notFound();
  }

  return <StationDetails station={station} showButtons={["edit", "schedule", "watch"]} />;
}