"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import type { Video } from "@prisma/client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface AddVideoAtTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoSelected: (video: Video | { duration: number }) => void;
}

export default function AddVideoAtTimeModal({ isOpen, onClose, onVideoSelected }: AddVideoAtTimeModalProps) {
  const params = useParams();
  const stationId = params.id as string;
  const [emptySpaceHours, setEmptySpaceHours] = useState("0");
  const [emptySpaceMinutes, setEmptySpaceMinutes] = useState("0");

  const { data, isFetching, isError } = api.stations.getStationVideos.useQuery({ stationId }, { enabled: !!stationId });

  const handleEmptySpaceSubmit = () => {
    const hours = parseInt(emptySpaceHours);
    const minutes = parseInt(emptySpaceMinutes);
    const totalSeconds = hours * 3600 + minutes * 60;

    if (totalSeconds > 0 && totalSeconds <= 86340) {
      // 23:59:00 in seconds
      onVideoSelected({
        duration: totalSeconds,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Video to Schedule</DialogTitle>
        </DialogHeader>

        <Card className="bg-muted/50" variant="secondary">
          <CardContent>
            <h1 className="text-sm text-muted-foreground pb-2">Add Dead Air</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Input type="number" min="0" max="23" value={emptySpaceHours} onChange={(e) => setEmptySpaceHours(e.target.value)} className="w-16" placeholder="Hours" />
                <span className="text-xs text-muted-foreground">hrs</span>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" min="0" max="59" value={emptySpaceMinutes} onChange={(e) => setEmptySpaceMinutes(e.target.value)} className="w-16" placeholder="Minutes" />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleEmptySpaceSubmit}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 overflow-y-auto max-h-[calc(90vh-12rem)]">
          {isFetching ? (
            <div className="col-span-full flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : isError ? (
            <div className="col-span-full text-center text-red-500 py-8">Error loading videos. Please try again later.</div>
          ) : data?.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">No videos found for this station. Add some before creating a schedule.</div>
          ) : (
            data?.map((videoStation) => (
              <div key={videoStation.videoId} className="flex flex-col overflow-hidden rounded-lg border cursor-pointer hover:border-gray-400 transition-colors" onClick={() => onVideoSelected(videoStation.video)}>
                <img src={videoStation.video.thumbnail} alt={videoStation.video.title} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold">{videoStation.video.title}</h3>
                  <p className="text-sm text-gray-500">{videoStation.video.youtubeChannel}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
