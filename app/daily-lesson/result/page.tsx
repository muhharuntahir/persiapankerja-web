import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { dailyLessonSession } from "@/db/schema";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { eq } from "drizzle-orm";

export default async function DailyResultPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/");

  const session = await db.query.dailyLessonSession.findFirst({
    where: eq(dailyLessonSession.userId, data.user.id),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  if (!session) redirect("/learn");

  return (
    <div className="max-w-xl mx-auto py-12 text-center">
      <h1 className="text-2xl font-bold">Latihan Harian Selesai 🎉</h1>
      <p className="mt-4 text-lg">XP Didapat: {session.totalXp}</p>

      <a
        href="/daily-leaderboard"
        className="mt-6 inline-block text-blue-600 underline"
      >
        Lihat papan peringkat
      </a>
    </div>
  );
}
