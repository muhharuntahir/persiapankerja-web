import db from "@/db/drizzle";
import { dailyLessonSession } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default async function DailyLeaderboard() {
  const rows = await db.query.dailyLessonSession.findMany({
    where: eq(dailyLessonSession.date, today()),
    orderBy: (t) => [desc(t.totalXp)],
    limit: 20,
  });

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-xl font-bold mb-6">Papan Peringkat Hari Ini</h1>

      {rows.map((r, i) => (
        <div key={r.id} className="flex justify-between py-2 border-b">
          <span>#{i + 1}</span>
          <span>{r.totalXp} XP</span>
        </div>
      ))}
    </div>
  );
}
