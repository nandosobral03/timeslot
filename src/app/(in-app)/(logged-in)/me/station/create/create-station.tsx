"use client";

import type { Tag } from "@prisma/client";
import EditStationPage, { type EditStationForm } from "../components/edit-station";
import { api } from "@/trpc/react";

export default function CreateStation({ tagOptions }: { tagOptions: Tag[] }) {
  const emptyStation: Parameters<typeof EditStationPage>[0]["station"] = {
    id: "",
    name: "",
    description: "",
    thumbnail: "",
    isPublic: false,
    isRandomized: false,
    adClip: null,
    tags: [],
    videos: [],
  };

  const createStation = api.stations.createStation.useMutation();

  const onSubmit = async (data: EditStationForm) => {
    console.log(data);
    const station = await createStation.mutateAsync({
      name: data.name,
      description: data.description,
      thumbnail: data.thumbnail,
      tags: data.tags.map((tag) => tag.id),
      videos: data.videos.map((video) => video.id),
    });
    window.location.href = `/me/station/${station.id}`;
  };

  return <EditStationPage station={emptyStation} onSubmit={onSubmit} isLoading={createStation.isPending} tagOptions={tagOptions} />;
}