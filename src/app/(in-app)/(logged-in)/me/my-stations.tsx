import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Station } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

export default function MyStations({ stations }: { stations: Station[] }) {
  return (
    <Card className="space-y-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <CardTitle>My Stations</CardTitle>
            <CardDescription>Manage your stations</CardDescription>
          </div>
          <Button asChild>
            <Link href="/me/create-station">Create New Station</Link>
          </Button>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stations?.map((station) => (
          <Link href={`/stations/${station.id}`} key={station.id}>
            <div className="hover:shadow-lg transition-shadow rounded-lg border p-4">
              <div className="pb-2">
                <h3 className="text-lg font-semibold">{station.name}</h3>
              </div>
              <div>
                <Image src={station.thumbnail} alt={station.name} width={300} height={169} className="rounded-md w-full object-cover aspect-video" />
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{station.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* TODO: Add create station modal when isCreating is true */}
    </Card>
  );
}
