import { getCurrentSession } from "@/server/auth/cookies";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();

  if (!session.user) {
    return redirect("/auth/login");
  }

  return <>{children}</>;
}
