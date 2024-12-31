"use client";

import { useState, useEffect } from "react";
import { Moon, Timer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dayjs from "dayjs";

export default function SleepControl({ onSleep, onWake }: { onSleep: () => void; onWake: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [customMinutes, setCustomMinutes] = useState("");
  const [sleepAfter, setSleepAfter] = useState<Date | null>(null);
  const [isSleeping, setIsSleeping] = useState(false);

  useEffect(() => {
    if (!sleepAfter) return;

    const interval = setInterval(() => {
      if (dayjs().isAfter(sleepAfter)) {
        handleSleep();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepAfter]);

  const handleSleep = () => {
    setIsSleeping(true);
    onSleep();
  };

  const handleWake = () => {
    setIsSleeping(false);
    setSleepTimer(null);
    setSleepAfter(null);
    onWake();
  };

  const handleSleepSelect = (minutes: number) => {
    setSleepTimer(minutes);
    const sleepTime = dayjs().add(minutes, "minute").toDate();
    setSleepAfter(sleepTime);
    setIsOpen(false);
  };

  const handleCustomSubmit = () => {
    const minutes = parseInt(customMinutes);
    if (!isNaN(minutes) && minutes > 0) {
      handleSleepSelect(minutes);
    }
  };

  const cancelTimer = () => {
    setSleepTimer(null);
    setSleepAfter(null);
  };

  return (
    <>
      {isSleeping && (
        <div className="fixed inset-0 bg-black/90 z-99999 flex items-center justify-center cursor-pointer" onClick={handleWake}>
          <p className="text-primary text-xl max-w-sm text-center">
            Sweet dreams
            <br />
            <span className="text-primary/80 text-sm">Once you wake up be sure to click anywhere to continue</span>
          </p>
        </div>
      )}

      {sleepTimer ? (
        <div className="absolute top-4 right-4 z-9999 flex items-center gap-2">
          <Button variant="secondary" size="icon" onClick={cancelTimer} className="animate-pulse">
            <Timer className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button variant="default" size="icon" className="absolute top-4 right-4 z-9999" onClick={() => setIsOpen(true)}>
          <Moon className="h-6 w-6" />
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="px-4 py-2">
          <DialogHeader className="pb-2">
            <DialogTitle>Set Sleep Timer</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => handleSleepSelect(15)}>15 minutes</Button>
            <Button onClick={() => handleSleepSelect(30)}>30 minutes</Button>
            <Button onClick={() => handleSleepSelect(45)}>45 minutes</Button>
            <div className="flex gap-1">
              <Input type="number" placeholder="Custom" value={customMinutes} onChange={(e) => setCustomMinutes(e.target.value)} />
              <Button onClick={handleCustomSubmit}>Set</Button>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
