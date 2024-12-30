"use client";

import { useRouter } from "next/navigation";
import useSession from "./useSession";

const useAuthGuard = () => {
  const { isLoggedIn, isLoading } = useSession();
  const router = useRouter();

  return (fn: () => void) => {
    if (isLoading) return;
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    fn();
  };
};

export default useAuthGuard;
