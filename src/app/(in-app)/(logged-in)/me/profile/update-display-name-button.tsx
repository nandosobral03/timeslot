"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormLabel, FormMessage, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const updateDisplayNameSchema = z.object({
  displayName: z.string().min(8, "Display name must be at least 8 characters"),
});

type UpdateDisplayName = z.infer<typeof updateDisplayNameSchema>;

export default function UpdateDisplayNameButton() {
  const router = useRouter();
  const [isDisplayNameModalOpen, setIsDisplayNameModalOpen] = useState(false);
  const updateDisplayNameMutation = api.users.updateDisplayName.useMutation();

  const displayNameForm = useForm<UpdateDisplayName>({
    resolver: zodResolver(updateDisplayNameSchema),
    defaultValues: {
      displayName: "",
    },
  });

  const onUpdateDisplayName = async (data: UpdateDisplayName) => {
    try {
      await updateDisplayNameMutation.mutateAsync(data);
      toast.success("Display name updated successfully");
      router.refresh();
      setIsDisplayNameModalOpen(false);
    } catch {
      toast.error("Failed to update display name");
    }
  };

  return (
    <>
      <Button onClick={() => setIsDisplayNameModalOpen(true)}>Update Display Name</Button>
      {isDisplayNameModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h2 className="text-lg font-semibold">Update Display Name</h2>
              <p className="text-sm text-muted-foreground">Enter your new display name below</p>
            </div>
            <Form {...displayNameForm}>
              <form onSubmit={displayNameForm.handleSubmit(onUpdateDisplayName)} className="space-y-4">
                <FormField
                  control={displayNameForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="New display name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDisplayNameModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateDisplayNameMutation.isPending}>
                    {updateDisplayNameMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </>
  );
}
