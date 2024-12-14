"use client";

import type { Tag } from "@prisma/client";
import EditStationPage from "../edit-station";

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

  return (
    <EditStationPage
      station={emptyStation}
      onSubmit={(data) => {
        console.log(data);
      }}
      tagOptions={tagOptions}
    />
  );
}
