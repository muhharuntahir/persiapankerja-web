import Link from "next/link";
import { NotebookText } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  unitSlug: string;
  title: string;
  description: string;
};

export const UnitBanner = ({ unitSlug, title, description }: Props) => {
  return (
    <div className="w-full rounded-xl bg-sky-500 px-5 py-8 text-white flex items-center justify-between">
      <div className="space-y-2.5">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-lg">{description}</p>
      </div>
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
    </div>
  );
};
