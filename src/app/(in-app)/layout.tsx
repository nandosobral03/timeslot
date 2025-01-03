"use client";

import Nav from "../_components/common/nav";
import { ThemeProvider } from "next-themes";
import NextNProgress from "nextjs-progressbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className="flex min-h-screen flex items-stretch justify-center bg-background h-screen p-4 relative">
        <Nav />
        <section className="flex-1 overflow-y-auto">{children}</section>
        <div className="absolute bottom-0 left-0 right-0">
          <NextNProgress color="#FF0000" startPosition={0.3} stopDelayMs={200} height={3} showOnShallow={true} />
        </div>
      </main>
    </ThemeProvider>
  );
}
