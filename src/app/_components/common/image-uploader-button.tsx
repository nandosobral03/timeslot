"use client";

import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ImageUploaderButton({ onUpload }: { onUpload: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File | undefined) => {
    if (!file) {
      toast.error("No file selected");
      return false;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return false;
    }

    return true;
  };

  const uploadToImgur = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: {
        Authorization: `Client-ID ${env.NEXT_PUBLIC_IMGUR_CLIENT_ID}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.data.error || "Failed to upload to Imgur");
    }

    return data.data.link;
  };

  const clearFileInput = () => {
    const input = document.getElementById("image-upload") as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!validateFile(file)) {
      return;
    }

    try {
      setIsUploading(true);
      const imageUrl = await uploadToImgur(file!);
      onUpload(imageUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Upload failed: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred while uploading");
      }
      console.error(error);
    } finally {
      setIsUploading(false);
      clearFileInput();
    }
  };

  return (
    <Button variant="outline" disabled={isUploading} onClick={() => document.getElementById("image-upload")?.click()} type="button">
      {isUploading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Uploading...
        </>
      ) : (
        <>
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </>
      )}
      <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </Button>
  );
}
