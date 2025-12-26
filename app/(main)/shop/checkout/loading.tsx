import { Loader } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-[300px] flex items-center justify-center">
      <Loader className="h-6 w-6 animate-spin text-neutral-500" />
    </div>
  );
}
