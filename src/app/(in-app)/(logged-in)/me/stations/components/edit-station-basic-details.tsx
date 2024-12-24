"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUploaderButton from "@/app/_components/common/image-uploader-button";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UseFormReturn } from "react-hook-form";
import type { Tag } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EditStationForm } from "./edit-station";

export default function EditStationBasicDetails({ form, tagOptions }: { form: UseFormReturn<EditStationForm>; tagOptions: Tag[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Station Details</CardTitle>
        <CardDescription>What is the name of your station? What is it about? What kind of videos will be playing? Tell your audience what to expect.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Station Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-4">
                  {field.value && <Image src={field.value} alt="Station thumbnail" width={200} height={200} className="rounded-md" />}
                  <ImageUploaderButton
                    onUpload={(url) => {
                      field.onChange(url);
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap gap-1">
                    {field.value?.map((selectedTag) => (
                      <div key={selectedTag.id} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md flex items-center gap-1 text-sm">
                        {selectedTag.name}
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange(field.value.filter((t) => t.id !== selectedTag.id));
                          }}
                          className="ml-2 text-secondary-foreground/50 hover:text-secondary-foreground"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  {tagOptions.filter((tag) => !field.value?.some((t) => t.id === tag.id)).length > 0 && (
                    <Select
                      onValueChange={(tagId) => {
                        const tagToAdd = tagOptions.find((t) => t.id === tagId);
                        if (tagToAdd && !field.value?.some((t) => t.id === tagId)) {
                          field.onChange([...(field.value || []), tagToAdd]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add a tag..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tagOptions
                          .filter((tag) => !field.value?.some((t) => t.id === tag.id))
                          .map((tag) => (
                            <SelectItem key={tag.id} value={tag.id}>
                              {tag.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
