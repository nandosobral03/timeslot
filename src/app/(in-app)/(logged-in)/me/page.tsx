import { Suspense } from "react";
import { api } from "@/trpc/server";
import Image from "next/image";
import UpdatePasswordButton from "./update-password-button";
import UpdateDisplayNameButton from "./update-display-name-button";
export default async function MePage() {
  const user = await api.users.getCurrentUser();

  if (!user) return null;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container mx-auto py-8">
        <div className="bg-card rounded-lg p-8 shadow-sm">
          <div className="flex items-center gap-8">
            {user.image && <Image src={user.image} alt={user.displayName} width={128} height={128} className="rounded-full" />}
            <div>
              <h1 className="text-3xl font-bold">{user.displayName}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            {user.type === "credentials" && <UpdatePasswordButton />}
            <UpdateDisplayNameButton />
          </div>
        </div>
      </div>
    </Suspense>
  );
}
