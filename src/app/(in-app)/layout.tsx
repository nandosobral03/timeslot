"use client";

import Nav from "../_components/common/nav";
import { ThemeProvider } from "next-themes";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className="flex min-h-screen flex items-stretch justify-center bg-background h-screen p-4">
        <Nav />
        <section className="flex-1 overflow-y-auto">{children}</section>
      </main>
    </ThemeProvider>
  );
}
