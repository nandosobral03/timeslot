"use client";

import { Home, Radio, User, Bookmark } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes: { icon: React.ReactNode; name: string; path: string }[] = [
  {
    icon: <Home className="w-5 h-5" />,
    name: "Home",
    path: "/",
  },
  {
    icon: <Radio className="w-5 h-5" />,
    name: "Stations",
    path: "/browse",
  },
  {
    icon: <Bookmark className="w-5 h-5" />,
    name: "Favorites",
    path: "/favorites",
  },
  {
    icon: <User className="w-5 h-5" />,
    name: "Profile",
    path: "/profile",
  },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="h-full max-w-16 w-16 bg-foreground rounded-lg text-background flex flex-col items-center justify-start px-2 py-2 gap-2">
      {routes.map((route) => (
        <Link
          key={route.path}
          href={route.path}
          className={`flex flex-col items-center justify-center p-2 w-full transition-colors hover:bg-primary/60 hover:text-primary-foreground ${pathname === route.path ? "bg-primary text-primary-foreground" : ""} rounded-lg aspect-square`}
        >
          {route.icon}
        </Link>
      ))}
    </nav>
  );
}
