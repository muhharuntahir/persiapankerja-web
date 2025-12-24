"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startDailyLesson } from "@/actions/daily-lesson";

function getCountdown() {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);
  const diff = tomorrow.getTime() - now.getTime();

  const h = Math.floor(diff / 1000 / 60 / 60);
  const m = Math.floor((diff / 1000 / 60) % 60);
  const s = Math.floor((diff / 1000) % 60);

  return `${h} : ${m} : ${s}`;
}

export function DailyLessonCard({ available }: { available: boolean }) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(getCountdown());

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!available) return null;

  const onStart = async () => {
    const session = await startDailyLesson();
    if (!session) return;
    router.push("/daily-lesson");
  };

  return (
    <div className="w-full max-w-3xl rounded-xl px-6 py-5 border mb-12 bg-amber-200 border-amber-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Latihan Harian</h3>
          <p className="text-xs bg-amber-50 px-2 py-1 rounded-full inline-block mt-1">
            Berganti dalam {countdown}
          </p>
        </div>

        <Button variant="tertiary" onClick={onStart}>
          Mulai
        </Button>
      </div>
    </div>
  );
}
