import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export const Promo = () => {
  return (
    <div className="border-2 rounded-xl p-4 relative bg-white">
      <div className="absolute z-50 top-0 right-0 bg-amber-500 py-1 px-3 rounded-lg m-1 text-sm font-semibold text-white flex items-center  shadow-sm">
        <Star className="mr-1 w-4 h-4" />
        Promo
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-x-2">
          <Image src="/unlimited.svg" alt="Pro" height={26} width={26} />
          <h3 className="font-bold text-lg">Tingkatkan ke Pro</h3>
        </div>
        <p className="text-muted-foreground">Dapatkan hati tak terbatas!</p>
      </div>
      <Button asChild variant="secondary" className="w-full" size="lg">
        <Link href="/shop">Lihat Promo</Link>
      </Button>
    </div>
  );
};
