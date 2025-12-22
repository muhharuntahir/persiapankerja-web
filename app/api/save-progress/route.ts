import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) return NextResponse.json({ ok: false });

  const body = await req.json();

  await db
    .update(userProgress)
    .set({
      activeLessonId: body.lessonId,
      activeChallengeIndex: body.challengeIndex,
    })
    .where(eq(userProgress.userId, data.user.id));

  return NextResponse.json({ ok: true });
}
