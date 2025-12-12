import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export default async function SubscriptionSettingsPage() {
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
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Subscription History</h1>

      {subscriptions.map((sub) => (
        <div key={sub.id} className="border p-4 rounded mb-4">
          <p>
            <strong>Status:</strong> {sub.paymentStatus}
          </p>
          <p>
            <strong>Active:</strong> {sub.isActive ? "Yes" : "No"}
          </p>
          <p>
            <strong>Expires at:</strong> {sub.expiresAt?.toLocaleString()}
          </p>
          <p>
            <strong>Order ID:</strong> {sub.orderId}
          </p>
          <p>
            <strong>Amount:</strong> Rp{sub.grossAmount?.toLocaleString()}
          </p>
          <p>
            <strong>Created:</strong> {sub.createdAt?.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
