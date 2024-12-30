"use client";

import { useState } from "react";
import StationCard from "@/app/_components/station/station-card";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import PageWrapper from "@/app/_components/common/page-wrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Pill from "@/app/_components/common/pill";

export default function Following() {
  const [page, setPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string>("");

  const { data: tags } = api.tags.list.useQuery();
  const { data, isLoading, error } = api.stations.getFollowedStations.useQuery({
    page,
    tags: selectedTag ? [selectedTag] : [],
  });

  if (error) {
    return (
      <PageWrapper title="Following">
        <Card>
          <CardHeader>
            <CardTitle>Following</CardTitle>
            <CardDescription>Stations you are following</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-destructive mb-2">Failed to load followed stations</p>
              <p className="text-muted-foreground text-sm">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  const totalPages = Math.ceil((data?.total ?? 0) / 15);
  const hasNextPage = page < totalPages;

  return (
    <PageWrapper title="Following">
      <Card>
        <CardHeader>
          <CardTitle>Your followed stations</CardTitle>
          <CardDescription>Track your favorite stations and see what's playing in real-time, all in one place</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag) => (
                <Pill key={tag.id} className={`cursor-pointer ${selectedTag === tag.id ? "!bg-primary !text-primary-foreground" : ""}`} onClick={() => setSelectedTag(selectedTag === tag.id ? "" : tag.id)}>
                  {tag.name}
                </Pill>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoading ? (
                // Show loading skeletons in a 3-column grid
                <>
                  <div className="h-48 bg-secondary animate-pulse rounded-lg" />
                  <div className="h-48 bg-secondary animate-pulse rounded-lg" />
                  <div className="h-48 bg-secondary animate-pulse rounded-lg" />
                </>
              ) : (
                data?.stations.map((station) => (
                  <StationCard
                    key={station.id}
                    id={station.id}
                    name={station.name}
                    thumbnail={station.thumbnail}
                    tags={station.tags}
                    followersCount={station._count.followers}
                    scheduleItems={station.scheduleItems}
                    isPublic={station.isPublic}
                    shouldShowIfIsPublic
                    url={`/stations/${station.id}`}
                  />
                ))
              )}
            </div>
            {/* Pagination */}
            <div className="mt-4 flex justify-end items-center space-x-4">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={!hasNextPage} onClick={() => setPage((prev) => prev + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
