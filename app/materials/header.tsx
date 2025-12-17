import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type MaterialHeaderProps = {
  unitTitle: string;
};

export const MaterialHeader = ({ unitTitle }: MaterialHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
        <Link
          href="/learn"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-sky-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>

        <div className="h-5 w-px bg-neutral-300 mx-2" />

        <h1 className="text-lg font-semibold">{unitTitle}</h1>
      </div>
    </header>
  );
};
