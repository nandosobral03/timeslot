import { Suspense } from "react";
import { api } from "@/trpc/server";
import CreateStation from "./create-station";

export default async function CreateStationPage() {
  const tags = await api.tags.list();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container mx-auto p-4">
        <CreateStation tagOptions={tags} />
      </div>
    </Suspense>
  );
}
