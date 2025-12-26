export const dynamic = "force-dynamic";
export const revalidate = 0;

import Image from "next/image";
import { redirect } from "next/navigation";

import { Promo } from "@/components/promo";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { getUserProgress, getUserSubscription } from "@/db/queries";

import { Items } from "./items";
import { Quests } from "@/components/quests";
import Subscription from "./subscription";
import { History } from "lucide-react";
import { MainWrapper } from "@/components/main-wrapper";

const ShopPage = async () => {
  const [userProgress, userSubscription] = await Promise.all([
    getUserProgress(),
    getUserSubscription(), // sudah tidak cache!
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  const isPro = userSubscription?.isActive === true;

  return (
    <MainWrapper>
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={isPro}
        />
        {!isPro && <Promo />}
        <Quests points={userProgress.points} />
      </StickyWrapper>

      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          <Image src="/shop.svg" alt="Shop" height={90} width={90} />
          <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">
            Toko
          </h1>
          <p className="text-muted-foreground text-center text-lg mb-6">
            Gunakan poinmu untuk membeli barang-barang keren.
          </p>

          <Items
            hearts={userProgress.hearts}
            points={userProgress.points}
            hasActiveSubscription={isPro}
          />
        </div>

        {isPro && (
          <div className="w-full">
            <Subscription />
          </div>
        )}
      </FeedWrapper>
    </MainWrapper>
  );
};

export default ShopPage;
