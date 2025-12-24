import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

type Props = {
  status: "correct" | "wrong" | "none";
  onNext: () => void;
};

export function DailyFooter({ status, onNext }: Props) {
  return (
    <footer className="h-[100px] border-t-2 flex items-center px-10">
      {status === "correct" && (
        <div className="text-sky-500 font-bold flex items-center">
          <CheckCircle className="mr-2" /> Jawaban benar
        </div>
      )}

      {status === "wrong" && (
        <div className="text-rose-500 font-bold flex items-center">
          <XCircle className="mr-2" /> Jawaban salah
        </div>
      )}

      <Button className="ml-auto" onClick={onNext}>
        Berikutnya
      </Button>
    </footer>
  );
}
