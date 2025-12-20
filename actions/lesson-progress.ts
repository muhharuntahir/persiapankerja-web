"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import db from "@/db/drizzle";
import {
  challenges,
  challengeProgress,
  lessons,
  lessonProgress,
  userProgress,
} from "@/db/schema";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function completeLesson(lessonId: number) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1️⃣ Ambil lesson
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
  });
  if (!lesson) return;

  // 2️⃣ Ambil semua challenge lesson
  const lessonChallenges = await db.query.challenges.findMany({
    where: eq(challenges.lessonId, lessonId),
  });
  if (lessonChallenges.length === 0) return;

  // 3️⃣ Ambil progress challenge user
  const completed = await db.query.challengeProgress.findMany({
    where: and(
      eq(challengeProgress.userId, user.id),
      eq(challengeProgress.completed, true)
    ),
  });

  const completedIds = new Set(completed.map((c) => c.challengeId));

  const allDone = lessonChallenges.every((c) => completedIds.has(c.id));
  if (!allDone) return;

  // 4️⃣ SIMPAN lesson selesai
  await db
    .insert(lessonProgress)
    .values({
      userId: user.id,
      lessonId,
      completed: true,
    })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: {
        completed: true,
        updatedAt: new Date(),
      },
    });

  // 5️⃣ Cari lesson berikutnya
  const nextLesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, lesson.unitId),
      eq(lessons.order, lesson.order + 1)
    ),
  });

  // 6️⃣ Update posisi user
  await db
    .update(userProgress)
    .set({
      activeLessonId: nextLesson?.id ?? lessonId,
      activeChallengeIndex: 0,
    })
    .where(eq(userProgress.userId, user.id));

  // 7️⃣ Revalidate UI
  revalidatePath("/learn");
  revalidatePath(`/lesson/${lessonId}`);
}
