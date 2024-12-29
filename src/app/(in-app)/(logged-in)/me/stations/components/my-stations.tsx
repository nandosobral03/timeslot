import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import type { RouterOutputs } from "@/trpc/react";
import StationCard from "@/app/_components/station/station-card";

export default function MyStations({ stations }: { stations: RouterOutputs["stations"]["getMyStations"] }) {
  return (
    <Card className="space-y-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <CardTitle>My Stations</CardTitle>
            <CardDescription>Manage your stations</CardDescription>
          </div>
          <Button asChild>
            <Link href="/me/stations/create">Create New Station</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stations?.map((station) => (
            <StationCard
              key={station.id}
              id={station.id}
              name={station.name}
              thumbnail={station.thumbnail}
              tags={station.tags}
              followersCount={station._count?.followers ?? 0}
              scheduleItems={station.scheduleItems ?? []}
              isPublic={station.isPublic}
              shouldShowIfIsPublic
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
