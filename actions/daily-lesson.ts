"use server";

import { eq, and, sql } from "drizzle-orm";
import db from "@/db/drizzle";
import {
  units,
  lessons,
  challenges,
  dailyLessonSession,
  dailyLessonQuestions,
  dailyLessonAnswers,
  userProgress,
} from "@/db/schema";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/* =========================
 * UTIL
 * ========================= */
function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/* =========================
 * START DAILY LESSON
 * ========================= */
export async function startDailyLesson() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1️⃣ cek session hari ini
  const existing = await db.query.dailyLessonSession.findFirst({
    where: and(
      eq(dailyLessonSession.userId, user.id),
      eq(dailyLessonSession.date, today())
    ),
  });

  if (existing) return existing;

  // 2️⃣ ambil semua unit
  const allUnits = await db.query.units.findMany({
    with: {
      lessons: {
        with: {
          challenges: true,
        },
      },
    },
  });

  if (allUnits.length < 5) {
    return null; // tidak tampil daily lesson
  }

  // 3️⃣ ambil 1 challenge random per unit
  const pickedChallenges: number[] = [];

  for (const unit of allUnits) {
    const allChallenges = unit.lessons.flatMap((l) => l.challenges);
    if (allChallenges.length === 0) continue;

    const random =
      allChallenges[Math.floor(Math.random() * allChallenges.length)];
    pickedChallenges.push(random.id);
  }

  // 4️⃣ shuffle → ambil 5
  const finalChallenges = pickedChallenges
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  // 5️⃣ buat session
  const [session] = await db
    .insert(dailyLessonSession)
    .values({
      userId: user.id,
      date: today(),
    })
    .returning();

  // 6️⃣ simpan soal
  await db.insert(dailyLessonQuestions).values(
    finalChallenges.map((challengeId, index) => ({
      sessionId: session.id,
      challengeId,
      order: index,
    }))
  );

  return session;
}

export async function submitDailyAnswer({
  sessionId,
  challengeId,
  isCorrect,
  timeSpentMs,
}: {
  sessionId: number;
  challengeId: number;
  isCorrect: boolean;
  timeSpentMs: number;
}) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // XP logic
  let xp = 0;
  if (isCorrect) {
    const maxTime = 10_000; // nanti bisa dari setting admin
    const ratio = Math.max(0, 1 - timeSpentMs / maxTime);
    xp = Math.round(10 * ratio);
  }

  // simpan jawaban
  await db.insert(dailyLessonAnswers).values({
    sessionId,
    challengeId,
    isCorrect,
    timeSpentMs,
    xp,
  });

  // kurangi heart jika salah
  if (!isCorrect) {
    await db
      .update(userProgress)
      .set({
        hearts: sql`GREATEST(hearts - 1, 0)`,
      })
      .where(eq(userProgress.userId, user.id));
  }

  return { xp };
}

export async function finishDailyLesson(sessionId: number) {
  const answers = await db.query.dailyLessonAnswers.findMany({
    where: eq(dailyLessonAnswers.sessionId, sessionId),
  });

  const totalXp = answers.reduce((sum, a) => sum + a.xp, 0);

  await db
    .update(dailyLessonSession)
    .set({
      completed: true,
      totalXp,
    })
    .where(eq(dailyLessonSession.id, sessionId));

  return { totalXp };
}
