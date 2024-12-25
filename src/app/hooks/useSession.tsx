import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function useSession() {
  const router = useRouter();

  const { data: session, isLoading } = api.users.getCurrentUser.useQuery(undefined, {
    retry: false,
  });

  const { mutate: logout } = api.users.logout.useMutation();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        window.location.href = "/";
      },
    });
  };

  const login = () => {
    router.push("/auth/login");
  };

  return {
    isLoggedIn: session !== null,
    user: session,
    isLoading: isLoading,
    logout: handleLogout,
    login,
  };
}
