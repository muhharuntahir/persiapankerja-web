// app/materials/layout.tsx
import { ReactNode } from "react";

export default function MaterialsLayout({ children }: { children: ReactNode }) {
  return <div className="h-screen bg-white flex flex-col">{children}</div>;
}
