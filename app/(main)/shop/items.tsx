"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { POINTS_TO_REFILL } from "@/constants";
import { refillHearts } from "@/actions/user-progress";
import { createMidtransPayment } from "@/actions/user-subscription";

type Props = {
  hearts: number;
  points: number;
  hasActiveSubscription: boolean;
};

export const Items = ({ hearts, points, hasActiveSubscription }: Props) => {
  const [pending, startTransition] = useTransition();

  const onRefillHearts = () => {
    if (pending || hearts === 5 || points < POINTS_TO_REFILL) {
      return;
    }

    startTransition(() => {
      refillHearts().catch(() => toast.error("Something went wrong"));
    });
  };

  const onUpgrade = () => {
    startTransition(() => {
      createMidtransPayment()
        .then((res: any) => {
          if (res?.redirectUrl) {
            window.location.href = res.redirectUrl;
          }
        })
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const onSettings = () => {
    window.location.href = "/settings/subscription";
  };

  return (
    <ul className="w-full">
      <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
        <Image src="/heart.svg" alt="Heart" height={60} width={60} />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Isi Hati
          </p>
        </div>
        <Button
          onClick={onRefillHearts}
          disabled={pending || hearts === 5 || points < POINTS_TO_REFILL}
        >
          {hearts === 5 ? (
            "full"
          ) : (
            <div className="flex items-center">
              <Image src="/points.svg" alt="Points" height={20} width={20} />
              <p>{POINTS_TO_REFILL}</p>
            </div>
          )}
        </Button>
      </div>
      <div className="flex items-center w-full p-4 pt-8 gap-x-4 border-t-2">
        <Image src="/unlimited.svg" alt="Unlimited" height={60} width={60} />
        <div className="flex-1">
          <p className="text-neutral-700 text-base lg:text-xl font-bold">
            Hati Tak Terbatas
          </p>
        </div>
        <Button
          onClick={hasActiveSubscription ? onSettings : onUpgrade}
          disabled={pending}
          variant={hasActiveSubscription ? "default" : "secondary"}
        >
          {hasActiveSubscription ? "Pengaturan" : "Beli Sekarang"}
        </Button>
      </div>
    </ul>
  );
};
