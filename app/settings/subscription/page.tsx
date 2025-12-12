import { getUserSubscription } from "@/db/queries";

export default async function SubscriptionSettingsPage() {
  const subscription = await getUserSubscription();

  if (!subscription) {
    return <div>No subscription found.</div>;
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Subscription Settings</h1>

      <p>Status: {subscription.isActive ? "Active" : "Inactive"}</p>
      <p>Expires at: {subscription.expiresAt?.toLocaleString()}</p>

      {subscription.isActive ? (
        <p className="mt-4 text-green-600">Your Pro subscription is active!</p>
      ) : (
        <p className="mt-4 text-red-600">Your subscription is not active.</p>
      )}
    </div>
  );
}
