"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export default function CreateConnectionAPIKeyButton() {
  const [extensionAPIKeyModalOpen, setExtensionAPIKeyModalOpen] = useState(false);

  const { mutate: refreshAPIToken, isPending } = api.users.refreshAPIToken.useMutation();
  const { data: apiToken } = api.users.getAPIToken.useQuery();

  const utils = api.useUtils();
  const handleRefreshClick = () => {
    const userConfirmed = window.confirm("Warning: If you have already used this API key, it will become invalid after refreshing. You will need to update it in your extension.");
    if (userConfirmed) {
      refreshAPIToken(undefined, {
        onSuccess: () => {
          utils.users.getAPIToken.invalidate();
        },
      });
    }
  };

  const handleCopyClick = () => {
    if (apiToken) {
      navigator.clipboard.writeText(apiToken).then(() => {
        toast.success("API key copied to clipboard!");
      });
    }
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setExtensionAPIKeyModalOpen(true)}>
        Browser Extension
      </Button>

      <Dialog open={extensionAPIKeyModalOpen} onOpenChange={setExtensionAPIKeyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Timeslot Extension</DialogTitle>
            <DialogDescription>Add videos directly to your stations from your browser, no need to copy and paste URLs. Simply download the Timeslot extension and link it using the API key below.</DialogDescription>
          </DialogHeader>
          {apiToken && (
            <div className="flex items-center w-full bg-background p-2 rounded-md justify-between">
              <p className="mr-2 text-xs text-muted-foreground">{apiToken}</p>
              <Button variant="secondary" onClick={handleCopyClick}>
                <Copy />
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setExtensionAPIKeyModalOpen(false)} disabled={isPending}>
              Close
            </Button>
            <Button variant="destructive" onClick={handleRefreshClick} disabled={isPending}>
              Refresh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
