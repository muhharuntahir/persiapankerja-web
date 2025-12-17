// scripts/prod.ts
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "../db/schema";

// Create postgres client (Supabase Pooler requires prepare: false)
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

// Create drizzle instance
const db = drizzle(client, { schema });

const main = async () => {
  try {
    console.log("🌱 Seeding database...");

    // =============================
    // 1. DELETE ALL DATA (ORDER MATTERS!)
    // =============================
    await db.delete(schema.challengeOptions);
    await db.delete(schema.challengeProgress);
    await db.delete(schema.userProgress);
    await db.delete(schema.userSubscription);
    await db.delete(schema.challenges);
    await db.delete(schema.lessons);
    await db.delete(schema.units);
    await db.delete(schema.courses);

    // =============================
    // 2. INSERT 1 COURSE
    // =============================
    const courses = await db
      .insert(schema.courses)
      .values([{ title: "Spanish", imageSrc: "/es.svg" }])
      .returning();

    const course = courses[0];

    // =============================
    // 3. INSERT UNITS
    // =============================
    const units = await db
      .insert(schema.units)
      .values([
        {
          courseId: course.id,
          title: "Unit 1",
          slug: "unit-1",
          description: `Learn the basics of ${course.title}`,
          order: 1,
        },
        {
          courseId: course.id,
          title: "Unit 2",
          slug: "unit-2",
          description: `Learn intermediate ${course.title}`,
          order: 2,
        },
      ])
      .returning();

    // =============================
    // 3.5 INSERT MATERIALS (PER UNIT)
    // =============================
    for (const unit of units) {
      await db.insert(schema.materials).values([
        {
          unitId: unit.id,
          title: `Materi ${unit.title}`,
          order: 1,
          content: `
## ${unit.title}

Ini adalah materi pembelajaran untuk **${unit.title}**.

### Pembahasan:
- Penjelasan konsep dasar
- Contoh soal
- Tips mengerjakan soal CPNS

### Catatan Penting:
Selalu prioritaskan logika dan ketelitian.
      `,
        },
      ]);
    }

    // =============================
    // 4. INSERT LESSONS + CHALLENGES
    // =============================
    for (const unit of units) {
      const lessons = await db
        .insert(schema.lessons)
        .values([
          { unitId: unit.id, title: "Nouns", order: 1 },
          { unitId: unit.id, title: "Verbs", order: 2 },
          { unitId: unit.id, title: "Adjectives", order: 3 },
          { unitId: unit.id, title: "Phrases", order: 4 },
          { unitId: unit.id, title: "Sentences", order: 5 },
        ])
        .returning();

      for (const lesson of lessons) {
        // ----- Insert challenges -----
        const challenges = await db
          .insert(schema.challenges)
          .values([
            {
              lessonId: lesson.id,
              type: "SELECT",
              question: 'Which one of these is "the man"?',
              order: 1,
            },
            {
              lessonId: lesson.id,
              type: "SELECT",
              question: 'Which one of these is "the woman"?',
              order: 2,
            },
            {
              lessonId: lesson.id,
              type: "SELECT",
              question: 'Which one of these is "the boy"?',
              order: 3,
            },
            {
              lessonId: lesson.id,
              type: "ASSIST",
              question: '"the man"',
              order: 4,
            },
            {
              lessonId: lesson.id,
              type: "SELECT",
              question: 'Which one of these is "the zombie"?',
              order: 5,
            },
            {
              lessonId: lesson.id,
              type: "SELECT",
              question: 'Which one of these is "the robot"?',
              order: 6,
            },
            {
              lessonId: lesson.id,
              type: "SELECT",
              question: 'Which one of these is "the girl"?',
              order: 7,
            },
            {
              lessonId: lesson.id,
              type: "ASSIST",
              question: '"the zombie"',
              order: 8,
            },
          ])
          .returning();

        // =============================
        // 5. INSERT CHALLENGE OPTIONS
        // =============================
        for (const challenge of challenges) {
          const opts = getOptionsForChallenge(challenge.order);
          if (opts.length > 0) {
            await db.insert(schema.challengeOptions).values(
              opts.map((option) => ({
                challengeId: challenge.id,
                ...option,
              }))
            );
          }
        }
      }
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await client.end();
  }
};

main();

/**
 * Helper: challenge options based on order
 */
function getOptionsForChallenge(order: number) {
  switch (order) {
    case 1:
      return [
        {
          correct: true,
          text: "el hombre",
          imageSrc: "/man.svg",
          audioSrc: "/es_man.mp3",
        },
        {
          correct: false,
          text: "la mujer",
          imageSrc: "/woman.svg",
          audioSrc: "/es_woman.mp3",
        },
        {
          correct: false,
          text: "el chico",
          imageSrc: "/boy.svg",
          audioSrc: "/es_boy.mp3",
        },
      ];

    case 2:
      return [
        {
          correct: true,
          text: "la mujer",
          imageSrc: "/woman.svg",
          audioSrc: "/es_woman.mp3",
        },
        {
          correct: false,
          text: "el chico",
          imageSrc: "/boy.svg",
          audioSrc: "/es_boy.mp3",
        },
        {
          correct: false,
          text: "el hombre",
          imageSrc: "/man.svg",
          audioSrc: "/es_man.mp3",
        },
      ];

    case 3:
      return [
        {
          correct: false,
          text: "la mujer",
          imageSrc: "/woman.svg",
          audioSrc: "/es_woman.mp3",
        },
        {
          correct: false,
          text: "el hombre",
          imageSrc: "/man.svg",
          audioSrc: "/es_man.mp3",
        },
        {
          correct: true,
          text: "el chico",
          imageSrc: "/boy.svg",
          audioSrc: "/es_boy.mp3",
        },
      ];

    case 4:
      return [
        { correct: false, text: "la mujer", audioSrc: "/es_woman.mp3" },
        { correct: true, text: "el hombre", audioSrc: "/es_man.mp3" },
        { correct: false, text: "el chico", audioSrc: "/es_boy.mp3" },
      ];

    case 5:
      return [
        {
          correct: false,
          text: "el hombre",
          imageSrc: "/man.svg",
          audioSrc: "/es_man.mp3",
        },
        {
          correct: false,
          text: "la mujer",
          imageSrc: "/woman.svg",
          audioSrc: "/es_woman.mp3",
        },
        {
          correct: true,
          text: "el zombie",
          imageSrc: "/zombie.svg",
          audioSrc: "/es_zombie.mp3",
        },
      ];

    case 6:
      return [
        {
          correct: true,
          text: "el robot",
          imageSrc: "/robot.svg",
          audioSrc: "/es_robot.mp3",
        },
        {
          correct: false,
          text: "el zombie",
          imageSrc: "/zombie.svg",
          audioSrc: "/es_zombie.mp3",
        },
        {
          correct: false,
          text: "el chico",
          imageSrc: "/boy.svg",
          audioSrc: "/es_boy.mp3",
        },
      ];

    case 7:
      return [
        {
          correct: true,
          text: "la nina",
          imageSrc: "/girl.svg",
          audioSrc: "/es_girl.mp3",
        },
        {
          correct: false,
          text: "el zombie",
          imageSrc: "/zombie.svg",
          audioSrc: "/es_zombie.mp3",
        },
        {
          correct: false,
          text: "el hombre",
          imageSrc: "/man.svg",
          audioSrc: "/es_man.mp3",
        },
      ];

    case 8:
      return [
        { correct: false, text: "la mujer", audioSrc: "/es_woman.mp3" },
        { correct: true, text: "el zombie", audioSrc: "/es_zombie.mp3" },
        { correct: false, text: "el chico", audioSrc: "/es_boy.mp3" },
      ];

    default:
      return [];
  }
}
