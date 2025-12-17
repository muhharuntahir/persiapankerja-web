"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  materials: {
    id: number;
    title: string;
    completed: boolean;
  }[];
  currentId: number;
  unitSlug: string;
};

export default function MaterialSidebar({
  materials,
  currentId,
  unitSlug,
}: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="p-6 space-y-2">
      <h3 className="font-semibold text-lg mb-4">Daftar Materi</h3>

      {materials.map((m) => (
        <Link
          key={m.id}
          href={`/materials/${unitSlug}/${m.id}`}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded",
            m.id === currentId
              ? "bg-sky-100 text-sky-600 font-medium"
              : "hover:bg-neutral-100"
          )}
        >
          <CheckCircle
            className={cn(
              "h-4 w-4",
              m.completed ? "text-sky-500" : "text-neutral-300"
            )}
          />
          {m.title}
        </Link>
      ))}
    </div>
  );
}
