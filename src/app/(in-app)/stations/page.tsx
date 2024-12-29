"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import YouTubeSearch from "@/app/_components/common/youtube-search";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PageWrapper from "@/app/_components/common/page-wrapper";
import StationCard from "@/app/_components/station/station-card";
export default function BrowseStationsPage() {
  const [search, setSearch] = useState("");
  const [youtubeSearch, setYoutubeSearch] = useState<{ id: string; type: "video" | "channel"; title: string; thumbnail: string } | null>(null);

  const [sortBy, setSortBy] = useState<"createdAt" | "followersCount">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: stations, isLoading } = api.stations.listStations.useQuery({
    page,
    pageSize,
    search,
    videoId: youtubeSearch?.type === "video" ? youtubeSearch.id : undefined,
    channelId: youtubeSearch?.type === "channel" ? youtubeSearch.id : undefined,
    sortBy,
    sortOrder,
  });

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setPage(1);
  };

  const totalPages = Math.ceil((stations?.total ?? 0) / pageSize);
  const hasNextPage = page < totalPages;

  return (
    <PageWrapper title="Browse Stations">
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find stations by name, video content, or other criteria</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Search Stations</label>
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Find stations by video/channel</label>
            <YouTubeSearch
              onChange={(data) => {
                setYoutubeSearch(data);
              }}
              value={youtubeSearch}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as "createdAt" | "followersCount")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Created At</SelectItem>
                    <SelectItem value="followersCount">Popularity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={toggleSortOrder} variant="ghost" className="px-6">
                {sortOrder === "asc" ? <ArrowUp /> : <ArrowDown />}
              </Button>
            </div>
          </div>

          <Button onClick={() => setPage(1)} className="w-full">
            Search
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Stations</CardTitle>
          <CardDescription>Browse through available stations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stations?.stations?.map((station) => (
                <StationCard
                  key={station.id}
                  id={station.id}
                  name={station.name}
                  thumbnail={station.thumbnail}
                  tags={station.tags}
                  followersCount={station._count.followers}
                  scheduleItems={station.scheduleItems}
                  isPublic={station.isPublic}
                />
              ))}
            </div>
          )}

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
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
