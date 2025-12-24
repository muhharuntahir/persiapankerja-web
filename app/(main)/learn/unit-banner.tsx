import Link from "next/link";
import { NotebookText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  unitSlug: string;
  title: string;
  description: string;
  isPro: boolean;
};

export const UnitBanner = ({ unitSlug, title, description, isPro }: Props) => {
  return (
    <div
      className={cn(
        "relative w-full rounded-xl px-5 py-8 flex items-center justify-between",
        isPro ? "bg-sky-500 text-white" : "bg-neutral-200 text-neutral-400"
      )}
    >
      {/* 🔒 OVERLAY */}
      {/* {!isPro && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
          <span className="font-semibold text-sm">
            🔒 Materi hanya untuk Pro
          </span>
        </div>
      )} */}

      <div className="space-y-2.5">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-lg">{description}</p>
      </div>

      {isPro && (
        <Link href={`/materials/${unitSlug}`}>
          <Button
            size="lg"
            variant="secondary"
            className="border-2 border-b-4 active:border-b-2"
          >
            <NotebookText className="mr-2" />
            <span className="hidden xl:inline">Materi</span>
          </Button>
        </Link>
      )}
    </div>
    // <div className="w-full rounded-xl bg-sky-500 px-5 py-8 text-white flex items-center justify-between">
    //   <div className="space-y-2.5">
    //     <h3 className="text-2xl font-bold">{title}</h3>
    //     <p className="text-lg">{description}</p>
    //   </div>
    //   <Link href={`/materials/${unitSlug}`}>
    //     <Button
    //       size="lg"
    //       variant="secondary"
    //       className="border-2 border-b-4 active:border-b-2"
    //     >
    //       <NotebookText className="mr-2" />
    //       <span className="hidden xl:inline">Materi</span>
    //     </Button>
    //   </Link>
    // </div>
  );
};
