import PageWrapper from "@/app/_components/common/page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/server";
import Image from "next/image";
import CreateConnectionAPIKeyButton from "./profile/create-conection-api-key-button";
import UpdateDisplayNameButton from "./profile/update-display-name-button";
import UpdatePasswordButton from "./profile/update-password-button";
import UserStations from "./stations/components/my-stations";

export default async function MePage() {
  const user = await api.users.getCurrentUser();
  const stations = await api.stations.getMyStations();
  if (!user) return null;

  return (
    <PageWrapper title="Profile">
      <Card>
        <CardHeader>
          <CardTitle>About me</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            {user.image && <Image src={user.image} alt={user.displayName} width={128} height={128} className="rounded-full w-24 h-24 md:w-32 md:h-32" />}
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">{user.displayName}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <UpdateDisplayNameButton />
            {user.type === "credentials" && <UpdatePasswordButton />}
            <CreateConnectionAPIKeyButton />
          </div>
        </CardContent>
      </Card>
      <UserStations stations={stations} me />
    </PageWrapper>
  );
}
