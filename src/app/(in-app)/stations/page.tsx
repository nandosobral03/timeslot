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
import Pill from "@/app/_components/common/pill";

export default function BrowseStationsPage() {
  const [search, setSearch] = useState("");
  const [youtubeSearch, setYoutubeSearch] = useState<{ id: string; type: "video" | "channel"; title: string; thumbnail: string } | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("");

  const [sortBy, setSortBy] = useState<"createdAt" | "followersCount">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const pageSize = 10;

  const [searchParams, setSearchParams] = useState({
    search: "",
    youtubeSearch: null as typeof youtubeSearch,
    selectedTag: "",
    sortBy: "createdAt" as "createdAt" | "followersCount",
    sortOrder: "desc" as "asc" | "desc",
    page: 1,
  });

  const { data: tags } = api.tags.list.useQuery();

  const { data: stations, isLoading } = api.stations.listStations.useQuery({
    page: searchParams.page,
    pageSize,
    search: searchParams.search,
    videoId: searchParams.youtubeSearch?.type === "video" ? searchParams.youtubeSearch.id : undefined,
    channelId: searchParams.youtubeSearch?.type === "channel" ? searchParams.youtubeSearch.id : undefined,
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder,
    tags: searchParams.selectedTag ? [searchParams.selectedTag] : [],
  });

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleSearch = () => {
    setSearchParams({
      search,
      youtubeSearch,
      selectedTag,
      sortBy,
      sortOrder,
      page: 1,
    });
  };

  const totalPages = Math.ceil((stations?.total ?? 0) / pageSize) || 1;
  const hasNextPage = searchParams.page < totalPages;

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
            <label className="text-sm font-medium">Filter by Tag</label>
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag) => (
                <Pill key={tag.id} className={`cursor-pointer ${selectedTag === tag.id ? "!bg-primary !text-primary-foreground" : ""}`} onClick={() => setSelectedTag(selectedTag === tag.id ? "" : tag.id)}>
                  {tag.name}
                </Pill>
              ))}
            </div>
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

          <Button onClick={handleSearch} className="w-full">
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
            <Button variant="outline" size="sm" disabled={searchParams.page === 1} onClick={() => setSearchParams((prev) => ({ ...prev, page: prev.page - 1 }))}>
              Previous
            </Button>
            <span className="text-sm">
              Page {searchParams.page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={!hasNextPage} onClick={() => setSearchParams((prev) => ({ ...prev, page: prev.page + 1 }))}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
