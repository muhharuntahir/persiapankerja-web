import Link from "next/link";

import { cn } from "@/lib/utils";

interface Props {
  materials: {
    id: number;
    title: string;
    completed: boolean;
  }[];
  currentId: number;
  unitSlug: string;
  completed: boolean;
}

export default function MaterialFooter({
  materials,
  currentId,
  unitSlug,
  completed,
}: Props) {
  const index = materials.findIndex((m) => m.id === currentId);
  const prev = materials[index - 1];
  const next = materials[index + 1];
  const current = materials[index];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 mt-12 p-6 border-t flex items-center justify-between bg-white">
      {prev ? (
        <Link
          href={`/materials/${unitSlug}/${prev.id}`}
          className="text-sky-600"
        >
          ← {prev.title}
        </Link>
      ) : (
        <span />
      )}

      <span className="font-medium">{current.title}</span>

      {completed && next ? (
        <Link
          href={`/materials/${unitSlug}/${next.id}`}
          className="text-sky-600"
        >
          {next.title} →
        </Link>
      ) : (
        <button className="text-sky-600 font-medium">
          Tandai sudah dipelajari
        </button>
      )}
    </footer>
  );
}
