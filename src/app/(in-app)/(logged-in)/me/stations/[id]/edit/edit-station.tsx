"use client";

import { Switch } from "@/components/ui/switch";
import { type RouterOutputs, api } from "@/trpc/react";
import type { Tag } from "@prisma/client";
import { useState } from "react";
import EditStationPage, { type EditStationForm } from "../../components/edit-station";

export default function EditStation({ station, tagOptions }: { station: NonNullable<RouterOutputs["stations"]["getStationById"]>; tagOptions: Tag[] }) {
  const { mutateAsync: updateStation, isPending } = api.stations.updateStation.useMutation();
  const [isPublic, setIsPublic] = useState(station.isPublic);

  const initialFormState: EditStationForm = {
    id: station.id,
    name: station.name,
    description: station.description,
    thumbnail: station.thumbnail,
    followersCount: station.followersCount,
    tags: station.tags,
    userId: station.userId,
    adClip: station.adClip,
    createdAt: station.createdAt,
    isPublic: isPublic,
    isRandomized: station.isRandomized,
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

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="ml-auto flex items-center gap-2">
          <Switch id="publicSwitch" checked={isPublic} onCheckedChange={setIsPublic} />
          <span className="text-sm">{isPublic ? "Public" : "Private"}</span>
        </div>
      </div>
      <EditStationPage station={initialFormState} onSubmit={onSubmit} isLoading={isPending} tagOptions={tagOptions} />
    </div>
  );
}
