"use client";

import { HydrateClient } from "@/trpc/server";
import { ThemeProvider } from "next-themes";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <HydrateClient>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <main className="flex min-h-screen flex items-stretch justify-center bg-background h-screen p-4">
          <section className="flex-1">{children}</section>
        </main>
      </ThemeProvider>
    </HydrateClient>
  );
}
