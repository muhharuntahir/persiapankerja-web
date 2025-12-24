"use client";

import { CircularProgressbarWithChildren } from "react-circular-progressbar";

type Props = {
  timeLeft: number;
  totalTime: number;
};

export function TimerCircle({ timeLeft, totalTime }: Props) {
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="w-[70px] h-[70px]">
      <CircularProgressbarWithChildren value={progress}>
        <span className="text-lg font-bold text-neutral-700">{timeLeft}</span>
      </CircularProgressbarWithChildren>
    </div>
  );
}
