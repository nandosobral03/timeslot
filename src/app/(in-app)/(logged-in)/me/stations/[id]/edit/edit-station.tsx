"use client";

import { Switch } from "@/components/ui/switch";
import { type RouterOutputs, api } from "@/trpc/react";
import type { Tag } from "@prisma/client";
import { useState } from "react";
import EditStationPage, { type EditStationForm } from "../../components/edit-station";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function EditStation({ station, tagOptions }: { station: NonNullable<RouterOutputs["stations"]["getStationById"]>; tagOptions: Tag[] }) {
  const { mutateAsync: updateStation, isPending } = api.stations.updateStation.useMutation();
  const { mutateAsync: deleteStation, isPending: isDeleting } = api.stations.deleteStation.useMutation();
  const [isPublic, setIsPublic] = useState(station.isPublic);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const initialFormState: EditStationForm = {
    id: station.id,
    name: station.name,
    description: station.description,
    thumbnail: station.thumbnail,
    followersCount: station.followersCount,
    tags: station.tags,
    userId: station.userId,
    createdAt: station.createdAt,
    isPublic: isPublic,
    videos: station.videos.map((video) => ({
      id: video.videoId,
      thumbnail: video.video.thumbnail,
      title: video.video.title,
      duration: video.video.duration,
      category: video.video.category,
      youtubeChannel: video.video.youtubeChannel,
      youtubeChannelId: video.video.youtubeChannelId,
    })),
  };

  const onSubmit = async (data: EditStationForm) => {
    const updatedStation = await updateStation({
      id: station.id,
      name: data.name,
      description: data.description,
      thumbnail: data.thumbnail,
      tags: data.tags.map((tag) => tag.id),
      videos: data.videos.map((video) => video.id),
      isPublic: isPublic,
    });
    window.location.href = `/me/stations/${updatedStation.id}`;
  };

  const handleDelete = async () => {
    await deleteStation({ id: station.id });
    window.location.href = "/me";
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Switch id="publicSwitch" checked={isPublic} onCheckedChange={setIsPublic} />
          <span className="text-sm">{isPublic ? "Public" : "Private"}</span>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm" className="ml-auto flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Station
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>This action cannot be undone. This will permanently delete your station.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <EditStationPage station={initialFormState} onSubmit={onSubmit} isLoading={isPending} tagOptions={tagOptions} />
    </div>
  );
}
