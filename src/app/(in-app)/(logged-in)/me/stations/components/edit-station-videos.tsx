"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { api } from "@/trpc/react"; // Assuming you have a TRPC setup
import Image from "next/image";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { EditStationForm } from "./edit-station";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function EditStationVideos({ form }: { form: UseFormReturn<EditStationForm> }) {
  const [videoUrl, setVideoUrl] = useState("");
  const [batchUrls, setBatchUrls] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addVideo = api.videos.addVideo.useMutation();
  const addVideoBatch = api.videos.addVideoBatch.useMutation();
  const videos = form.watch("videos") || [];

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return url.includes("youtube.com") || url.includes("youtu.be");
    } catch {
      return false;
    }
  };

  const handleAddVideo = async () => {
    try {
      const { successfulVideos, failedVideos } = await addVideo.mutateAsync({ url: videoUrl });
      form.setValue("videos", [...videos, ...successfulVideos]);
      setVideoUrl("");
      toast.success(`Added ${successfulVideos.length} video${successfulVideos.length > 1 ? "s" : ""}`);
      if (failedVideos.length > 0) {
        toast.error(`Failed to add video${failedVideos.length > 1 ? "s" : ""}: ${failedVideos.map((video) => video.videoId).join(", ")}`);
      }
    } catch {
      toast.error("Failed to add video");
    }
  };

  const handleBatchUpload = async () => {
    try {
      const urls = batchUrls.split("\n").filter((url) => url.trim() !== "");
      const { successfulVideos, failedVideos } = await addVideoBatch.mutateAsync({ urls });
      form.setValue("videos", [...videos, ...successfulVideos]);
      setBatchUrls("");
      setIsModalOpen(false);
      toast.success(`Added ${successfulVideos.length} video${successfulVideos.length > 1 ? "s" : ""}`);
      if (failedVideos.length > 0) {
        toast.error(`Failed to add video${failedVideos.length > 1 ? "s" : ""}: ${failedVideos.map((video) => video.videoId).join(", ")}`);
      }
    } catch {
      toast.error("Failed to add videos");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Videos</CardTitle>
        <CardDescription>What videos are you going to be playing in your station? (Don't worry, you can add more later)</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="videos"
          render={() => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <div>
                <FormControl>
                  <Input type="text" placeholder="Enter YouTube video or playlist URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} disabled={addVideo.isPending} />
                </FormControl>
                <div className="flex gap-2 mt-2">
                  <Button type="button" onClick={handleAddVideo} disabled={!isValidUrl(videoUrl) || addVideo.isPending}>
                    {addVideo.isPending ? <Loader2 className="animate-spin" /> : "Add Video"}
                  </Button>
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="secondary" disabled={addVideoBatch.isPending}>
                        {addVideoBatch.isPending ? <Loader2 className="animate-spin" /> : "Batch Upload"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Batch Upload Videos</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col gap-4">
                        <Textarea placeholder="Enter YouTube URLs (one per line)" value={batchUrls} onChange={(e) => setBatchUrls(e.target.value)} rows={10} />
                        <Button onClick={handleBatchUpload} disabled={addVideoBatch.isPending || !batchUrls.trim()}>
                          {addVideoBatch.isPending ? <Loader2 className="animate-spin" /> : "Upload Videos"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="flex flex-wrap gap-4">
          {videos.map((video) => (
            <button
              key={video.id}
              className="relative group"
              onClick={() => {
                const updatedVideos = videos.filter((v) => v.id !== video.id);
                form.setValue("videos", updatedVideos, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
            >
              <Image src={video.thumbnail} alt={video.title} width={200} height={200} className="rounded-md cursor-pointer" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm">{video.title}</span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
