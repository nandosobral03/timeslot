import PageWrapper from "@/app/_components/common/page-wrapper";
import StationCard from "@/app/_components/station/station-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/server";

export default async function Home() {
  const popularStations = await api.homepage.getPopularStations();
  const newStations = await api.homepage.getNewStations();

  return (
    <PageWrapper>
      <Card>
        <CardContent>
          <CardTitle className="mb-2">Welcome to Timeslot</CardTitle>
          <CardDescription>Your gateway to curated YouTube broadcasts! Create or tune in to any station broadcasting your favorite YouTube videos and channels at any time, all the time.</CardDescription>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Trending Stations</CardTitle>
          <CardDescription>See what stations people love the most!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularStations.map((station) => (
              <StationCard key={station.id} id={station.id} name={station.name} thumbnail={station.thumbnail} tags={station.tags} followersCount={station._count.followers} scheduleItems={station.scheduleItems} isPublic={station.isPublic} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Stations</CardTitle>
          <CardDescription>Oh what's that, someone created a new station? Check it out!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newStations.map((station) => (
              <StationCard key={station.id} id={station.id} name={station.name} thumbnail={station.thumbnail} tags={station.tags} followersCount={station._count.followers} scheduleItems={station.scheduleItems} isPublic={station.isPublic} />
            ))}
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
