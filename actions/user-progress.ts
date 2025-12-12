"use server";

import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabaseServer";
import db from "@/db/drizzle";

import { POINTS_TO_REFILL } from "@/constants";
import { challengeProgress, challenges, userProgress } from "@/db/schema";

import {
  getCourseById,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries";

// ============ UPSERT USER PROGRESS ============
export const upsertUserProgress = async (courseId: number) => {
  const supa = createServerSupabaseClient();
  const {
    data: { user },
  } = await supa.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const course = await getCourseById(courseId);
  if (!course) throw new Error("Course not found");

  if (!course.units.length || !course.units[0].lessons.length) {
    throw new Error("Course is empty");
  }

  const existingUser = await getUserProgress();

  // ---- UPDATE PROGRESS ----
  if (existingUser) {
    await db
      .update(userProgress)
      .set({
        activeCourseId: courseId,
        userName: user.user_metadata.full_name || "User",
        userImageSrc: user.user_metadata.avatar_url || "/mascot.svg",
      })
      .where(eq(userProgress.userId, user.id));

    revalidatePath("/courses");
    revalidatePath("/learn");
    return redirect("/learn");
  }

  // ---- INSERT NEW PROGRESS ----
  await db.insert(userProgress).values({
    userId: user.id,
    activeCourseId: courseId,
    userName: user.user_metadata.full_name || "User",
    userImageSrc: user.user_metadata.avatar_url || "/mascot.svg",
  });

  revalidatePath("/courses");
  revalidatePath("/learn");
  return redirect("/learn");
};

// ============ REDUCE HEARTS ============
export const reduceHearts = async (challengeId: number) => {
  const supa = createServerSupabaseClient();
  const {
    data: { user },
  } = await supa.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const currentUser = await getUserProgress();
  const subscription = await getUserSubscription();

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });

  if (!challenge) throw new Error("Challenge not found");

  const existingChallenge = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, user.id),
      eq(challengeProgress.challengeId, challengeId)
    ),
  });

  const isPractice = !!existingChallenge;
  const lessonId = challenge.lessonId;

  if (isPractice) {
    return { error: "practice" };
  }

  if (!currentUser) throw new Error("User progress not found");

  if (subscription?.isActive) {
    return { error: "subscription" };
  }

  if (currentUser.hearts === 0) {
    return { error: "hearts" };
  }

  await db
    .update(userProgress)
    .set({
      hearts: Math.max(currentUser.hearts - 1, 0),
    })
    .where(eq(userProgress.userId, user.id));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};

// ============ REFILL HEARTS ============
export const refillHearts = async () => {
  const currentUser = await getUserProgress();

  if (!currentUser) {
    throw new Error("User progress not found");
  }

  if (currentUser.hearts === 5) {
    throw new Error("Hearts are already full");
  }

  if (currentUser.points < POINTS_TO_REFILL) {
    throw new Error("Not enough points");
  }

  await db
    .update(userProgress)
    .set({
      hearts: 5,
      points: currentUser.points - POINTS_TO_REFILL,
    })
    .where(eq(userProgress.userId, currentUser.userId));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
};
