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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

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

      <Dialog open={isDisplayNameModalOpen} onOpenChange={setIsDisplayNameModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Display Name</DialogTitle>
            <DialogDescription>Enter your new display name below</DialogDescription>
          </DialogHeader>

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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDisplayNameModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateDisplayNameMutation.isPending}>
                  {updateDisplayNameMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
