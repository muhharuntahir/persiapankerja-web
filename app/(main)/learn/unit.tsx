import { lessons, units } from "@/db/schema";

import { UnitBanner } from "./unit-banner";
import { LessonButton } from "./lesson-button";

type Props = {
  id: number;
  order: number;
  title: string;
  unitSlug: string;
  description: string;
  lessons: (typeof lessons.$inferSelect & {
    completed: boolean;
  })[];
  activeLesson:
    | (typeof lessons.$inferSelect & {
        unit: typeof units.$inferSelect;
      })
    | undefined;
  activeLessonPercentage: number;
  isPro: boolean;
};

export const Unit = ({
  id,
  order,
  title,
  unitSlug,
  description,
  lessons,
  activeLesson,
  activeLessonPercentage,
  isPro,
}: Props) => {
  return (
    <>
      <UnitBanner
        unitSlug={unitSlug}
        title={title}
        description={description}
        isPro={isPro}
      />
      <div className="relative mt-4">
        {/* 🔒 OVERLAY KHUSUS NON-PRO */}
        {!isPro && (
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl">
            <span className="text-sm font-semibold text-neutral-500">
              🔒 Khusus pengguna Pro
            </span>
          </div>
        )}

        <div className="flex items-center flex-col">
          {lessons.map((lesson, index) => {
            const previousLesson = lessons[index - 1];

            const isLocked = !isPro
              ? true
              : index !== 0 && !previousLesson?.completed;

            const isCurrent =
              lesson.id === activeLesson?.id ||
              (index === 0 &&
                !lesson.completed &&
                !lessons.some((l) => l.id === activeLesson?.id));

            return (
              <LessonButton
                key={lesson.id}
                id={lesson.id}
                title={lesson.title}
                index={index}
                totalCount={lessons.length - 1}
                locked={isLocked}
                current={isCurrent}
                completed={lesson.completed}
                percentage={isCurrent ? activeLessonPercentage : 0}
              />
            );
          })}
        </div>
      </div>

      {/* <div className="flex items-center flex-col relative mt-4">
        {lessons.map((lesson, index) => {
          const previousLesson = lessons[index - 1];

          // 🔒 terkunci jika bukan lesson pertama & lesson sebelumnya belum selesai
          const isLocked = !isPro
            ? true
            : index !== 0 && !previousLesson?.completed;

          // 🔥 CURRENT LOGIC YANG BENAR
          const isCurrent =
            lesson.id === activeLesson?.id ||
            (index === 0 &&
              !lesson.completed &&
              !lessons.some((l) => l.id === activeLesson?.id));

          return (
            <LessonButton
              key={lesson.id}
              id={lesson.id}
              title={lesson.title}
              index={index}
              totalCount={lessons.length - 1}
              locked={isLocked}
              current={isCurrent}
              completed={lesson.completed}
              percentage={isCurrent ? activeLessonPercentage : 0}
            />
          );
        })}
      </div> */}
    </>
  );
};
