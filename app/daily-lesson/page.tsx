"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { submitDailyAnswer, finishDailyLesson } from "@/actions/daily-lesson";
import { Challenge } from "@/app/lesson/challenge";
import { DailyHeader } from "./header";
import { DailyFooter } from "./footer";

export default function DailyLessonPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [status, setStatus] = useState<"none" | "correct" | "wrong">("none");

  const [timeLeft, setTimeLeft] = useState(30);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(Date.now());

  const current = questions[index];

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch("/api/daily-lesson")
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions);
        setSessionId(data.sessionId);
      });
  }, []);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!current) return;

    const limit = current.timeLimitSec ?? 30;
    setTimeLeft(limit);
    setStartTime(Date.now());

    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          handleAnswer(false); // ⛔ timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [index, current]);

  /* ================= ANSWER ================= */
  const handleAnswer = async (isCorrect: boolean) => {
    if (!sessionId || status !== "none") return;

    const spent = Date.now() - startTime;

    await submitDailyAnswer({
      sessionId,
      challengeId: current.id,
      isCorrect,
      timeSpentMs: spent,
    });

    if (!isCorrect) setHearts((h) => h - 1);
    setStatus(isCorrect ? "correct" : "wrong");
  };

  const onNext = async () => {
    if (index + 1 === questions.length) {
      await finishDailyLesson(sessionId!);
      router.push("/daily-lesson/result");
    } else {
      setStatus("none");
      setIndex((i) => i + 1);
    }
  };

  if (!current) return null;

  return (
    <div className="flex flex-col h-full">
      <DailyHeader
        hearts={hearts}
        percentage={Math.round((index / questions.length) * 100)}
        hasActiveSubscription
      />

      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-[600px] w-full px-6">
          <h1 className="text-xl font-bold mb-6">{current.question}</h1>

          <Challenge
            options={current.options}
            onSelect={(id) => {
              const opt = current.options.find((o: any) => o.id === id);
              handleAnswer(opt.correct);
            }}
            status={status}
            type={current.type}
            disabled={status !== "none"}
          />
        </div>
      </main>

      <DailyFooter status={status} onNext={onNext} />
    </div>
  );
}
