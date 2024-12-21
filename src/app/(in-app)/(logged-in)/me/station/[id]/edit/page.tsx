import { Suspense } from "react";
import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import EditStation from "./edit-station";

interface EditStationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditStationPage({ params }: EditStationPageProps) {
  const { id } = await params;

  // Fetch station data and tags from the server
  const [station, tags] = await Promise.all([api.stations.getStationById({ id }), api.tags.list()]);

  if (!station) {
    return notFound();
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container mx-auto p-4">
        <EditStation station={station} tagOptions={tags} />
      </div>
    </Suspense>
  );
}
