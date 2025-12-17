"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markMaterialCompleted } from "@/actions/material-progress";

type Props = {
  materialId: number;
  userId: string;
};

export function MarkMaterialCompleteButton({ materialId, userId }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await markMaterialCompleted(materialId, userId);

          // 🔥 INI KUNCINYA
          router.refresh();
        })
      }
      className="text-sky-600 font-medium"
    >
      {isPending ? "Menyimpan..." : "Tandai sudah dipelajari"}
    </button>
  );
}
