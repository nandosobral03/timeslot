"use client";

import type { Tag } from "@prisma/client";
import EditStationPage, { type EditStationForm } from "../../components/edit-station";
import { api, type RouterOutputs } from "@/trpc/react";

export default function EditStation({ station, tagOptions }: { station: NonNullable<RouterOutputs["stations"]["getStationById"]>; tagOptions: Tag[] }) {
  const { mutateAsync: updateStation, isPending } = api.stations.updateStation.useMutation();

  const initialFormState: EditStationForm = {
    id: station.id,
    name: station.name,
    description: station.description,
    thumbnail: station.thumbnail,
    tags: station.tags,
    userId: station.userId,
    adClip: station.adClip,
    createdAt: station.createdAt,
    isPublic: station.isPublic,
    isRandomized: station.isRandomized,
    videos: station.videos.map((video) => ({
      id: video.videoId,
      thumbnail: video.video.thumbnail,
      title: video.video.title,
      duration: video.video.duration,
      category: video.video.category,
      youtubeChannel: video.video.youtubeChannel,
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
    });
    window.location.href = `/me/stations/${updatedStation.id}`;
  };

  return <EditStationPage station={initialFormState} onSubmit={onSubmit} isLoading={isPending} tagOptions={tagOptions} />;
}
