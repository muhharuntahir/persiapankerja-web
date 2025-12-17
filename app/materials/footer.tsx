"use client";

import Link from "next/link";
import { MarkMaterialCompleteButton } from "./mark-complete-button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  materials: {
    id: number;
    title: string;
    completed: boolean;
  }[];
  currentId: number;
  unitSlug: string;
  completed: boolean;
  userId: string;
  nextLessonLink?: string | null;
}

export default function MaterialFooter({
  materials,
  currentId,
  unitSlug,
  completed,
  userId,
  nextLessonLink,
}: Props) {
  const index = materials.findIndex((m) => m.id === currentId);
  const prev = materials[index - 1];
  const next = materials[index + 1];
  const current = materials[index];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-6 flex justify-between items-center z-30">
      {/* PREVIOUS */}
      {prev ? (
        <Link
          href={`/materials/${unitSlug}/${prev.id}`}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}

      {/* CURRENT */}
      <span className="font-medium">{current.title}</span>

      {/* RIGHT ACTION */}
      {completed ? (
        next ? (
          <Link
            href={`/materials/${unitSlug}/${next.id}`}
            className="flex items-center space-x-2"
          >
            <span>{next.title}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : nextLessonLink ? (
          <Link
            href={nextLessonLink}
            className="text-sky-600 font-semibold flex items-center space-x-2"
          >
            <span>Masuk ke Latihan</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span />
        )
      ) : (
        <MarkMaterialCompleteButton materialId={currentId} userId={userId} />
      )}
    </footer>
  );
}
