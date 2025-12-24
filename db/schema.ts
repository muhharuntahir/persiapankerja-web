import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  unique,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageSrc: text("image_src").notNull(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
  userProgress: many(userProgress),
  units: many(units),
}));

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(), // Unit 1
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(), // Learn the basics of spanish
  courseId: integer("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull(),
});

export const unitsRelations = relations(units, ({ many, one }) => ({
  course: one(courses, {
    fields: [units.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  unitId: integer("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull(),
});

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  challenges: many(challenges),
  lessonProgress: many(lessonProgress),
}));

export const challengesEnum = pgEnum("type", ["SELECT", "ASSIST"]);

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id")
    .references(() => lessons.id, { onDelete: "cascade" })
    .notNull(),
  type: challengesEnum("type").notNull(),
  question: text("question").notNull(),
  order: integer("order").notNull(),

  // Tambahan
  timeLimitSec: integer("time_limit_sec").notNull().default(30),
});

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [challenges.lessonId],
    references: [lessons.id],
  }),
  challengeOptions: many(challengeOptions),
  challengeProgress: many(challengeProgress),
}));

export const challengeOptions = pgTable("challenge_options", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
  correct: boolean("correct").notNull(),
  imageSrc: text("image_src"),
  audioSrc: text("audio_src"),
});

export const challengeOptionsRelations = relations(
  challengeOptions,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeOptions.challengeId],
      references: [challenges.id],
    }),
  })
);

export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const challengeProgressRelations = relations(
  challengeProgress,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeProgress.challengeId],
      references: [challenges.id],
    }),
  })
);

export const userProgress = pgTable("user_progress", {
  userId: text("user_id").primaryKey(),

  userName: text("user_name").notNull().default("User"),
  userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),

  activeCourseId: integer("active_course_id").references(() => courses.id, {
    onDelete: "cascade",
  }),

  // 🔥 TAMBAHAN PENTING
  activeLessonId: integer("active_lesson_id").references(() => lessons.id, {
    onDelete: "set null",
  }),
  activeChallengeIndex: integer("active_challenge_index").notNull().default(0),

  hearts: integer("hearts").notNull().default(5),
  points: integer("points").notNull().default(0),
});

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  activeCourse: one(courses, {
    fields: [userProgress.activeCourseId],
    references: [courses.id],
  }),
}));

export const userSubscription = pgTable("user_subscription", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),

  // MIDTRANS FIELDS
  orderId: text("order_id").notNull().unique(), // untuk simpan order
  paymentStatus: text("payment_status").notNull(),
  grossAmount: integer("gross_amount").notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  // OPTIONAL — update ketika payment selesai
  paymentType: text("payment_type"),
  transactionTime: timestamp("transaction_time"),
  transactionId: text("transaction_id"),
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),

  title: text("title").notNull(),
  content: text("content").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const materialsRelations = relations(materials, ({ one, many }) => ({
  unit: one(units, {
    fields: [materials.unitId],
    references: [units.id],
  }),
  progress: many(materialProgress), // ✅ INI PENTING
}));

export const materialProgress = pgTable(
  "material_progress",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    materialId: integer("material_id")
      .references(() => materials.id, { onDelete: "cascade" })
      .notNull(),
    completed: boolean("completed").default(false),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    userMaterialUnique: uniqueIndex("material_user_unique").on(
      table.materialId,
      table.userId
    ),
  })
);

export const materialProgressRelations = relations(
  materialProgress,
  ({ one }) => ({
    material: one(materials, {
      fields: [materialProgress.materialId],
      references: [materials.id],
    }),
  })
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    lessonId: integer("lesson_id")
      .references(() => lessons.id, { onDelete: "cascade" })
      .notNull(),

    completed: boolean("completed").notNull().default(false),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    lessonUserUnique: unique("lesson_user_unique").on(t.userId, t.lessonId),
  })
);

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
}));

/* ====================
 * Daily Lesson Session
 * ===================== */
export const dailyLessonSession = pgTable(
  "daily_lesson_session",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    date: text("date").notNull(), // YYYY-MM-DD
    completed: boolean("completed").default(false),
    totalXp: integer("total_xp").default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    uniqueUserDaily: unique("user_daily_unique").on(t.userId, t.date),
  })
);

/* ====================
 * Daily Lesson Questions
 * ===================== */
export const dailyLessonQuestions = pgTable("daily_lesson_questions", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => dailyLessonSession.id, {
    onDelete: "cascade",
  }),
  challengeId: integer("challenge_id").notNull(),
  order: integer("order").notNull(),
});

/* ====================
 * Daily Lesson Answers
 * ===================== */
export const dailyLessonAnswers = pgTable("daily_lesson_answers", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeSpentMs: integer("time_spent_ms").notNull(),
  xp: integer("xp").notNull(),
});
