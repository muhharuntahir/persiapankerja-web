import { NextResponse } from "next/server";
import { startDailyLesson } from "@/actions/daily-lesson";
import db from "@/db/drizzle";
import {
  dailyLessonQuestions,
  challenges,
  challengeOptions,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  // 1️⃣ start / ambil session hari ini
  const session = await startDailyLesson();

  if (!session) {
    return NextResponse.json({
      available: false,
      questions: [],
    });
  }

  // 2️⃣ ambil soal daily
  const rows = await db
    .select({
      id: challenges.id,
      question: challenges.question,
      type: challenges.type,
      options: challengeOptions,
    })
    .from(dailyLessonQuestions)
    .innerJoin(challenges, eq(dailyLessonQuestions.challengeId, challenges.id))
    .innerJoin(
      challengeOptions,
      eq(challengeOptions.challengeId, challenges.id)
    )
    .where(eq(dailyLessonQuestions.sessionId, session.id))
    .orderBy(asc(dailyLessonQuestions.order));

  // 3️⃣ normalisasi options per question
  const map = new Map<number, any>();

  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        question: row.question,
        type: row.type,
        options: [],
      });
    }

    map.get(row.id).options.push({
      id: row.options.id,
      text: row.options.text,
      correct: row.options.correct,
    });
  }

  return NextResponse.json({
    available: true,
    sessionId: session.id,
    questions: Array.from(map.values()),
  });
}
