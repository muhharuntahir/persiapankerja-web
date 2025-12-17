"use server";

import { eq, and, sql } from "drizzle-orm";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import db from "@/db/drizzle";
import { challengeProgress, userProgress, userSubscription } from "@/db/schema";

export async function upsertChallengeProgress(challengeId: number) {
  // =========================================
  // 1️⃣ AUTH (1 call)
  // =========================================
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");
  const userId = user.id;

  // =========================================
  // 2️⃣ LOAD MINIMAL DATA (2 queries)
  // =========================================
  const [progress, subscription] = await Promise.all([
    db.query.userProgress.findFirst({
      where: eq(userProgress.userId, userId),
      columns: { hearts: true, points: true },
    }),

    db.query.userSubscription.findFirst({
      where: eq(userSubscription.userId, userId),
      columns: {
        paymentStatus: true,
        isActive: true,
        expiresAt: true,
      },
    }),
  ]);

  if (!progress) throw new Error("User progress not found");

  const hasUnlimited =
    subscription?.paymentStatus === "paid" &&
    subscription.isActive === true &&
    subscription.expiresAt !== null &&
    subscription.expiresAt > new Date();

  // =========================================
  // 3️⃣ CHECK EXISTING PROGRESS (1 query)
  // =========================================
  const existing = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId)
    ),
    columns: { id: true },
  });

  const isPractice = !!existing;

  // =========================================
  // 4️⃣ HEARTS RULE (NO EXTRA QUERY)
  // =========================================
  if (progress.hearts === 0 && !isPractice && !hasUnlimited) {
    return { error: "hearts" };
  }

  // =========================================
  // 5️⃣ WRITE (MAX 2 QUERIES)
  // =========================================
  if (isPractice) {
    // PRACTICE MODE
    await Promise.all([
      db
        .update(challengeProgress)
        .set({ completed: true })
        .where(eq(challengeProgress.id, existing!.id)),

      db
        .update(userProgress)
        .set({
          hearts: Math.min(progress.hearts + 1, 5),
          points: progress.points + 10,
        })
        .where(eq(userProgress.userId, userId)),
    ]);

    return { success: true, practice: true };
  }

  // NEW CHALLENGE
  await Promise.all([
    db.insert(challengeProgress).values({
      userId,
      challengeId,
      completed: true,
    }),

    db
      .update(userProgress)
      .set({
        points: progress.points + 10,
      })
      .where(eq(userProgress.userId, userId)),
  ]);

  return { success: true };
}
