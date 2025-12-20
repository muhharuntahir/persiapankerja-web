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

export const LessonButton = ({
  id,
  index,
  title,
  totalCount,
  locked,
  current,
  percentage,
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
        "w-full max-w-3xl rounded-xl px-6 py-5 border transition mb-4",
        current && "bg-sky-200 border-sky-500 text-sky-500 border-2",
        isCompleted && "bg-sky-200 border-sky-300 text-sky-600 border-2",
        locked && "bg-neutral-100 border-neutral-200 text-neutral-400"
      )}
    >
      <div className="flex items-center justify-between">
        {/* LEFT TEXT */}
        <div className="text-lg font-medium">{title}</div>

        {/* RIGHT ICON */}
        <div className="relative" style={{}}>
          {current ? (
            <div className="h-[80px] w-[80px] relative">
              <div className="absolute -top-6 left-[0.2rem] px-3 py-2.5 border-2 font-semibold text-sm uppercase text-sky-500 bg-white rounded-xl animate-bounce tracking-wide z-10">
                Mulai
                <div className="absolute left-1/2 -bottom-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 transform -translate-x-1/2" />
              </div>
              <CircularProgressbarWithChildren
                value={Number.isNaN(percentage) ? 0 : percentage}
                styles={{
                  path: {
                    stroke: "#00A6F4",
                  },
                  trail: {
                    stroke: "#f2f9fc",
                  },
                }}
              >
                <Button
                  size="rounded"
                  variant={locked ? "locked" : "secondary"}
                  className="h-[50px] w-[50px] border-b-4"
                  disabled={locked}
                  onClick={handleClick}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      locked
                        ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                        : "fill-primary-foreground text-primary-foreground",
                      isCompleted && "fill-none stroke-[4]"
                    )}
                  />
                </Button>
              </CircularProgressbarWithChildren>
            </div>
          ) : (
            <Button
              size="rounded"
              variant={locked ? "locked" : "secondary"}
              className="h-[50px] w-[50px] border-b-4 mr-4"
              disabled={locked}
              onClick={handleClick}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  locked
                    ? "fill-neutral-400 text-neutral-400 stroke-neutral-400"
                    : "fill-primary-foreground text-primary-foreground",
                  isCompleted && "fill-none stroke-[4]"
                )}
              />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
