// "use server";

// import { eq, and } from "drizzle-orm";
// import { revalidatePath } from "next/cache";

// import { createServerSupabaseClient } from "@/lib/supabaseServer";
// import db from "@/db/drizzle";

// import { challengeProgress, challenges, userProgress } from "@/db/schema";

// import { getUserProgress, getUserSubscription } from "@/db/queries";

// export const upsertChallengeProgress = async (challengeId: number) => {
//   const supabase = createServerSupabaseClient();

//   // 🔐 Ambil user dari Supabase Auth
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (!user || userError) {
//     throw new Error("Unauthorized");
//   }

//   const userId = user.id;

//   // Ambil progress & subscription user
//   const currentUserProgress = await getUserProgress();
//   const subscription = await getUserSubscription();

//   if (!currentUserProgress) {
//     throw new Error("User progress not found");
//   }

//   // Cari challenge
//   const challenge = await db.query.challenges.findFirst({
//     where: eq(challenges.id, challengeId),
//   });

//   if (!challenge) {
//     throw new Error("Challenge not found");
//   }

//   const lessonId = challenge.lessonId;

//   // Cek apakah challenge ini sudah pernah dikerjakan
//   const existing = await db.query.challengeProgress.findFirst({
//     where: and(
//       eq(challengeProgress.userId, userId),
//       eq(challengeProgress.challengeId, challengeId)
//     ),
//   });

//   const isPractice = !!existing;

//   // HEARTS logic (Duolingo-style)
//   if (
//     currentUserProgress.hearts === 0 &&
//     !isPractice &&
//     !subscription?.isActive
//   ) {
//     return { error: "hearts" };
//   }

//   // ===============================
//   // 📌 CASE 1 — Practice challenge (sudah pernah dikerjakan)
//   // ===============================
//   if (isPractice) {
//     await db
//       .update(challengeProgress)
//       .set({ completed: true })
//       .where(eq(challengeProgress.id, existing.id));

//     await db
//       .update(userProgress)
//       .set({
//         hearts: Math.min(currentUserProgress.hearts + 1, 5),
//         points: currentUserProgress.points + 10,
//       })
//       .where(eq(userProgress.userId, userId));

//     // Revalidate halaman yang butuh update
//     revalidatePath("/learn");
//     revalidatePath("/lesson");
//     revalidatePath("/quests");
//     revalidatePath("/leaderboard");
//     revalidatePath(`/lesson/${lessonId}`);

//     return;
//   }

//   // ===============================
//   // 📌 CASE 2 — Challenge baru → Insert progress
//   // ===============================
//   await db.insert(challengeProgress).values({
//     userId,
//     challengeId,
//     completed: true,
//   });

//   // Tambah points
//   await db
//     .update(userProgress)
//     .set({
//       points: currentUserProgress.points + 10,
//     })
//     .where(eq(userProgress.userId, userId));

//   // Revalidate UI
//   revalidatePath("/learn");
//   revalidatePath("/lesson");
//   revalidatePath("/quests");
//   revalidatePath("/leaderboard");
//   revalidatePath(`/lesson/${lessonId}`);
// };

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
