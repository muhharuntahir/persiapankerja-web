"use server";

import db from "@/db/drizzle";
import { materialProgress } from "@/db/schema";

export const markMaterialCompleted = async (
  materialId: number,
  userId: string
) => {
  await db
    .insert(materialProgress)
    .values({
      materialId,
      userId,
      completed: true,
      completedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [materialProgress.materialId, materialProgress.userId],
      set: {
        completed: true,
        completedAt: new Date(),
      },
    });
};
