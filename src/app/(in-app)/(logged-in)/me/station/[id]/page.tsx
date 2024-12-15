import { notFound } from "next/navigation";
import { api } from "@/trpc/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface StationPageProps {
  params: {
    id: string;
  };
}

export default async function StationPage({ params }: StationPageProps) {
  const { id } = params;

  // Fetch station data from the server
  const station = await api.stations.getStationById({ id });

  if (!station) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle>{station.name}</CardTitle>
            <CardDescription>{station.description}</CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="default">
              <Link href={`/me/station/${station.id}/edit`}>Edit</Link>
            </Button>
            <Button variant="secondary">
              <Link href={`/me/station/${station.id}/schedule`}>Schedule</Link>
            </Button>
          </div>
        </CardHeader>
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
      </Card>
    </div>
  );
}
