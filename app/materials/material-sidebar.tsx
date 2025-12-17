"use client";

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
  progress: number;
};

export default function MaterialSidebar({
  materials,
  currentId,
  unitSlug,
  progress,
}: Props) {
  return (
    <aside className="sticky top-20 h-[calc(100vh-80px)] w-80 border-l pl-6 space-y-6 overflow-y-auto">
      {/* PROGRESS */}
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-neutral-200 rounded">
          <div
            className="h-2 bg-sky-500 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-1">
        <h3 className="font-semibold mb-2">Daftar Materi</h3>

        {materials.map((m) => (
          <Link
            key={m.id}
            href={`/materials/${unitSlug}/${m.id}`}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded text-sm",
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
    </aside>
  );
}
