"use client";

import { Form } from "@/components/ui/form";
import type { Station, Tag, Video } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import EditStationBasicDetails from "./edit-station-basic-details";
import EditStationVideos from "./edit-station-videos";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export type EditStationForm = Station & { tags: Tag[] } & { videos: Video[] };

export default function EditStationPage({ station, tagOptions, onSubmit, isLoading }: { station: Omit<EditStationForm, "userId" | "createdAt">; tagOptions: Tag[]; onSubmit: (data: EditStationForm) => void; isLoading: boolean }) {
  const form = useForm<EditStationForm>({
    defaultValues: {
      name: station.name,
      description: station.description,
      thumbnail: station.thumbnail,
      isPublic: station.isPublic,
      isRandomized: station.isRandomized,
      tags: station.tags,
      videos: station.videos,
    },
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string(),
        thumbnail: z.string(),
        isPublic: z.boolean(),
        isRandomized: z.boolean(),
        tags: z.array(z.object({ id: z.string(), name: z.string() })),
        videos: z.array(z.object({ id: z.string(), title: z.string() })),
      })
    ),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <EditStationBasicDetails form={form} tagOptions={tagOptions} />
        <EditStationVideos form={form} />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : "Save"}
        </Button>
      </form>
    </Form>
  );
}
