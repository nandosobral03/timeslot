"use client";

import useSession from "@/app/hooks/useSession";
import { Bookmark, Home, LogIn, LogOut, Radio, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const routes: { icon: React.ReactNode; name: string; path: string; needsAuth: boolean }[] = [
  {
    icon: <Home className="w-4 h-4" />,
    name: "Home",
    path: "/",
    needsAuth: false,
  },
  {
    icon: <Radio className="w-4 h-4" />,
    name: "Stations",
    path: "/stations",
    needsAuth: false,
  },
  {
    icon: <Bookmark className="w-4 h-4" />,
    name: "Favorites",
    path: "/following",
    needsAuth: true,
  },
  {
    icon: <User className="w-4 h-4" />,
    name: "Profile",
    path: "/me",
    needsAuth: true,
  },
];

export default function Nav() {
  const pathname = usePathname();
  const { isLoggedIn, isLoading, logout, login } = useSession();

  return (
    <nav className="h-full bg-background-light rounded-lg text-foreground flex flex-col items-center justify-between p-3 gap-2 shadow-md border border-primary/50 border-2">
      <div className="flex flex-col items-center gap-2">
        {routes.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            className={`flex flex-col items-center justify-center p-2 w-full transition-colors hover:bg-primary hover:text-primary-foreground ${pathname === route.path ? "bg-primary text-primary-foreground" : ""} rounded-lg aspect-square ${route.needsAuth && !isLoggedIn ? "hidden" : ""}`}
          >
            {route.icon}
          </Link>
        ))}
      </div>

      {!isLoading && (
        <button onClick={() => (isLoggedIn ? logout() : login())} className="flex flex-col items-center justify-center p-2 w-full transition-colors hover:bg-primary hover:text-primary-foreground rounded-lg aspect-square cursor-pointer">
          {isLoggedIn ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
        </button>
      )}
    </nav>
  );
}
