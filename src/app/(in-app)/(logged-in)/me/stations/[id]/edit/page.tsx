import PageWrapper from "@/app/_components/common/page-wrapper";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
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
    <PageWrapper title="Edit Station" showBackArrow>
      <EditStation station={station} tagOptions={tags} />
    </PageWrapper>
  );
}
