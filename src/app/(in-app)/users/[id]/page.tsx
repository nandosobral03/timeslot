import PageWrapper from "@/app/_components/common/page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/server";
import Image from "next/image";
import { redirect } from "next/navigation";
import UserStations from "../../(logged-in)/me/stations/components/my-stations";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch the user data based on the ID from the URL
  const user = await api.users.getUserById(id);
  const stations = await api.stations.getUserStations({ userId: id });
  const currentUser = await api.users.getCurrentUser();

  // Redirect to /me if the logged-in user is viewing their own profile
  if (currentUser && currentUser.id === id) {
    return redirect("/me");
  }

  if (!user) return <p>User not found</p>;

  return (
    <PageWrapper title={`${user.displayName}'s Profile`}>
      <Card>
        <CardHeader>
          <CardTitle>About {user.displayName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            {user.image && <Image src={user.image} alt={user.displayName} width={128} height={128} className="rounded-full w-24 h-24 md:w-32 md:h-32" />}
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">{user.displayName}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <UserStations stations={stations} />
    </PageWrapper>
  );
}
