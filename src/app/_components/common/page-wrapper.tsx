"use client";

import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import ChangeTheme from "./change-theme";

export default function PageWrapper({ children, title, showBackArrow = false, fullWidth = false }: { children: React.ReactNode; title?: string; showBackArrow?: boolean; fullWidth?: boolean }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className={cn("mx-auto p-4 flex flex-col gap-4 h-full w-full", fullWidth ? "w-full" : "max-w-(--breakpoint-lg) container")}>
        {title && (
          <div className="flex items-center gap-4 border-b border-foreground/10 pb-2 relative">
            {showBackArrow && (
              <button onClick={() => window.history.back()} className="text-primary hover:text-primary/80">
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            {title && <h1 className="text-3xl font-bold text-foreground">{title}</h1>}
          </div>
        )}
        <ChangeTheme />
        {children}
      </div>
    </Suspense>
  );
}
