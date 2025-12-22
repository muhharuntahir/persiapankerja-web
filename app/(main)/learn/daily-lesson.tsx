"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Crown, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import { Button } from "@/components/ui/button";

type Props = {
  id: number;
  index: number;
  title: string;
  totalCount: number;
  locked?: boolean;
  current?: boolean;
  percentage: number;
};

export const DailyLesson = ({
  id,
  index,
  title,
  totalCount = 0,
  locked = false,
  current = false,
  percentage = 0,
}: Props) => {
  const isLast = index === totalCount;
  const router = useRouter();
  const isCompleted = !locked && !current;
  const Icon = isCompleted ? Check : isLast ? Crown : Star;

  const handleClick = () => {
    if (locked) return;
    router.replace(`/lesson/${id}`);
  };

  return (
    <div
      className={cn(
        "w-full max-w-3xl rounded-xl px-6 py-5 border transition mb-12",
        current && "bg-amber-200 border-amber-500 text-amber-600 border-2",
        isCompleted && "bg-sky-200 border-sky-300 text-sky-600 border-2",
        locked && "bg-neutral-100 border-neutral-200 text-neutral-400"
      )}
    >
      <div className="flex items-center justify-between">
        {/* LEFT TEXT */}
        <div className="flex flex-col">
          <div className="text-lg font-medium">{title}</div>
          <div className="text-xs font-base py-1 px-2 bg-amber-50 rounded-full">
            Latihan diganti dalam 00 : 00 : 00
          </div>
        </div>

        {/* RIGHT ICON */}
        <div className="relative" style={{}}>
          {current ? (
            <Button
              variant={locked ? "locked" : "tertiary"}
              className="h-[50px] w-[100px] border-2 border-b-4 active:border-b-2"
              disabled={locked}
              onClick={handleClick}
            >
              Mulai
            </Button>
          ) : (
            <Button
              size="rounded"
              variant={locked ? "locked" : "tertiary"}
              className="h-[50px] w-[100px] border-2 border-b-4 active:border-b-2 mr-4"
              disabled={locked}
              onClick={handleClick}
            >
              MULAI
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
