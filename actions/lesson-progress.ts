// actions/lesson-progress.ts
"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { lessonProgress, challenges, challengeProgress } from "@/db/schema";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * Dipanggil setiap:
 * - user menjawab challenge
 * - user keluar di tengah lesson
 */
export async function updateLessonProgress(lessonId: number) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // ambil semua challenge lesson ini
  const lessonChallenges = await db.query.challenges.findMany({
    where: eq(challenges.lessonId, lessonId),
    with: {
      challengeProgress: {
        where: eq(challengeProgress.userId, user.id),
      },
    },
  });

  const total = lessonChallenges.length;
  const completed = lessonChallenges.filter(
    (c) =>
      c.challengeProgress.length > 0 &&
      c.challengeProgress.every((p) => p.completed)
  ).length;

  const isCompleted = total > 0 && completed === total;

  // UPSERT lesson_progress
  await db
    .insert(lessonProgress)
    .values({
      userId: user.id,
      lessonId,
      completed: isCompleted,
    })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        completed: isCompleted,
        updatedAt: new Date(),
      },
    });

  revalidatePath("/learn");
  revalidatePath(`/lesson/${lessonId}`);
}
