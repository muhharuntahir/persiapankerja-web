import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export default async function Subscription() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>Please login.</div>;

  // Ambil semua subscription user
  const subscriptions = await db.query.userSubscription.findMany({
    where: eq(userSubscription.userId, user.id),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  if (!subscriptions.length) return <div>No subscription history.</div>;

  return (
    <div className="mt-12 w-full">
      <h1 className="text-2xl font-bold mb-4 text-sky-700">
        Subscription History
      </h1>

      {subscriptions.map((sub) => (
        <div key={sub.id} className="border-2 p-4 rounded-2xl mb-4 text-sm">
          <p>
            <strong>Status :</strong>{" "}
            {sub.paymentStatus ? "Lunas" : "Belum Lunas"}
          </p>
          <p>
            <strong>Aktif :</strong>{" "}
            {sub.isActive ? "Sedang Aktif" : "Tidak Aktif"}
          </p>
          <p>
            <strong>Berakhir pada :</strong> {sub.expiresAt?.toLocaleString()}
          </p>
          <p>
            <strong>Order ID :</strong> {sub.orderId}
          </p>
          <p>
            <strong>Jumlah :</strong> Rp{sub.grossAmount?.toLocaleString()}
          </p>
          <p>
            <strong>Dibuat :</strong> {sub.createdAt?.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
