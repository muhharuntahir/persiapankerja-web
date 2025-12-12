// db/queries.ts

import { cache } from "react";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import {
  challengeProgress,
  courses,
  lessons,
  units,
  userProgress,
  userSubscription,
} from "@/db/schema";

import { createServerSupabaseClient } from "@/lib/supabaseServer";

/** UTIL: ambil user dari Supabase (server-side) */
async function getAuthUser() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/* ============================
   USER PROGRESS
=============================== */
export const getUserProgress = cache(async () => {
  const user = await getAuthUser();
  if (!user) return null;

  return db.query.userProgress.findFirst({
    where: eq(userProgress.userId, user.id),
    with: {
      activeCourse: true,
    },
  });
});

/* ============================
   UNITS (berisi lessons + challenges)
=============================== */
export const getUnits = cache(async () => {
  const user = await getAuthUser();
  const progress = await getUserProgress();

  if (!user || !progress?.activeCourseId) return [];

  const data = await db.query.units.findMany({
    orderBy: (t, { asc }) => [asc(t.order)],
    where: eq(units.courseId, progress.activeCourseId),
    with: {
      lessons: {
        orderBy: (t, { asc }) => [asc(t.order)],
        with: {
          challenges: {
            orderBy: (t, { asc }) => [asc(t.order)],
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, user.id),
              },
            },
          },
        },
      },
    },
  });

  // Normalize: cek apakah lesson sudah completed
  return data.map((unit) => {
    const lessonsWithStatus = unit.lessons.map((lesson) => {
      if (lesson.challenges.length === 0) {
        return { ...lesson, completed: false };
      }

      const allCompleted = lesson.challenges.every(
        (c) =>
          c.challengeProgress &&
          c.challengeProgress.length > 0 &&
          c.challengeProgress.every((p) => p.completed)
      );

      return { ...lesson, completed: allCompleted };
    });

    return { ...unit, lessons: lessonsWithStatus };
  });
});

/* ============================
   GET ALL COURSES
=============================== */
export const getCourses = cache(async () => {
  return db.query.courses.findMany();
});

/* ============================
   COURSE BY ID
=============================== */
export const getCourseById = cache(async (courseId: number) => {
  return db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      units: {
        orderBy: (u, { asc }) => [asc(u.order)],
        with: {
          lessons: {
            orderBy: (l, { asc }) => [asc(l.order)],
          },
        },
      },
    },
  });
});

/* ============================
   COURSE PROGRESS → active lesson
=============================== */
export const getCourseProgress = cache(async () => {
  const user = await getAuthUser();
  const progress = await getUserProgress();

  if (!user || !progress?.activeCourseId) return null;

  const unitsData = await db.query.units.findMany({
    orderBy: (u, { asc }) => [asc(u.order)],
    where: eq(units.courseId, progress.activeCourseId),
    with: {
      lessons: {
        orderBy: (l, { asc }) => [asc(l.order)],
        with: {
          unit: true,
          challenges: {
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, user.id),
              },
            },
          },
        },
      },
    },
  });

  const firstUncompletedLesson = unitsData
    .flatMap((u) => u.lessons)
    .find((lesson) =>
      lesson.challenges.some((c) => {
        return (
          !c.challengeProgress ||
          c.challengeProgress.length === 0 ||
          c.challengeProgress.some((p) => p.completed === false)
        );
      })
    );

  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  };
});

/* ============================
   LESSON DETAIL (BY ID OR ACTIVE)
=============================== */
export const getLesson = cache(async (id?: number) => {
  const user = await getAuthUser();
  if (!user) return null;

  const progress = await getCourseProgress();
  const lessonId = id || progress?.activeLessonId;
  if (!lessonId) return null;

  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        orderBy: (c, { asc }) => [asc(c.order)],
        with: {
          challengeOptions: true,
          challengeProgress: {
            where: eq(challengeProgress.userId, user.id),
          },
        },
      },
    },
  });

  if (!data) return null;

  const normalized = data.challenges.map((c) => {
    const completed =
      c.challengeProgress &&
      c.challengeProgress.length > 0 &&
      c.challengeProgress.every((p) => p.completed);

    return { ...c, completed };
  });

  return { ...data, challenges: normalized };
});

/* ============================
   LESSON COMPLETION PERCENTAGE
=============================== */
export const getLessonPercentage = cache(async () => {
  const progress = await getCourseProgress();
  if (!progress?.activeLessonId) return 0;

  const lesson = await getLesson(progress.activeLessonId);
  if (!lesson) return 0;

  const completed = lesson.challenges.filter((c) => c.completed).length;
  const total = lesson.challenges.length;

  return Math.round((completed / total) * 100);
});

/* ============================
   USER SUBSCRIPTION (Stripe)
=============================== */
const DAY = 86_400_000;
export const getUserSubscription = async () => {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const data = await db.query.userSubscription.findFirst({
    where: eq(userSubscription.userId, user.id),
  });

  if (!data) return null;

  const now = new Date();
  const isActive =
    data.paymentStatus === "paid" &&
    data.isActive === true &&
    data.expiresAt &&
    new Date(data.expiresAt) > now;

  return {
    ...data,
    isActive: Boolean(isActive),
  };
};

/* ============================
   TOP 10 USERS (LEADERBOARD)
=============================== */
export const getTopTenUsers = cache(async () => {
  const user = await getAuthUser();
  if (!user) return [];

  return db.query.userProgress.findMany({
    orderBy: (u, { desc }) => [desc(u.points)],
    limit: 10,
    columns: {
      userId: true,
      userName: true,
      userImageSrc: true,
      points: true,
    },
  });
});
