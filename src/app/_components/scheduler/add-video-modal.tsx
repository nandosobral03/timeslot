"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import type { Video } from "@prisma/client";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

const deadAirSchema = z
  .object({
    hours: z.coerce.number().min(0, "Hours must be at least 0").max(23, "Hours cannot exceed 23"),
    minutes: z.coerce.number().min(0, "Minutes must be at least 0").max(59, "Minutes cannot exceed 59"),
  })
  .refine(
    (data) => {
      const totalSeconds = data.hours * 3600 + data.minutes * 60;
      return totalSeconds > 0;
    },
    {
      message: "Total duration must be greater than 0",
      path: ["minutes"],
    }
  );

type DeadAirForm = z.infer<typeof deadAirSchema>;

interface AddVideoAtTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoSelected: (video: Video | { duration: number }) => void;
}

export default function AddVideoAtTimeModal({ isOpen, onClose, onVideoSelected }: AddVideoAtTimeModalProps) {
  const params = useParams();
  const stationId = params.id as string;

  const form = useForm<DeadAirForm>({
    resolver: zodResolver(deadAirSchema),
    defaultValues: {
      hours: 0,
      minutes: 0,
    },
  });

  const { data, isFetching, isError } = api.stations.getStationVideos.useQuery({ stationId }, { enabled: !!stationId });

  const handleEmptySpaceSubmit = (values: DeadAirForm) => {
    const totalSeconds = values.hours * 3600 + values.minutes * 60;
    onVideoSelected({
      duration: totalSeconds,
    });
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Video to Schedule</DialogTitle>
        </DialogHeader>

        <Card className="bg-muted/50" variant="secondary">
          <CardContent>
            <h1 className="text-sm text-muted-foreground pb-2">Add Dead Air</h1>
            <Form {...form}>
              {" "}
              <form onSubmit={form.handleSubmit(handleEmptySpaceSubmit)} className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name="hours"
                  render={({ field }) => (
                    <FormItem className="flex  items-center gap-2">
                      <FormControl>
                        <Input type="number" className="w-16" placeholder="Hours" {...field} />
                      </FormControl>
                      <span className="text-xs text-muted-foreground">hrs</span>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minutes"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Input type="number" className="w-16" placeholder="Minutes" {...field} />
                      </FormControl>
                      <span className="text-xs text-muted-foreground">min</span>
                    </FormItem>
                  )}
                />

                <Button variant="outline" size="sm" type="submit">
                  Add
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
