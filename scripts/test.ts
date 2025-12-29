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
      .values([{ title: "Matematika", imageSrc: "/math.svg" }])
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
        {
          courseId: course.id,
          title: "Unit 3",
          slug: "unit-3",
          description: `Learn intermediate ${course.title}`,
          order: 3,
        },
        {
          courseId: course.id,
          title: "Unit 4",
          slug: "unit-4",
          description: `Learn intermediate ${course.title}`,
          order: 4,
        },
        {
          courseId: course.id,
          title: "Unit 5",
          slug: "unit-5",
          description: `Learn intermediate ${course.title}`,
          order: 5,
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
          { unitId: unit.id, title: "Matematika Dasar 1", order: 1 },
          { unitId: unit.id, title: "Matematika Dasar 2", order: 2 },
          { unitId: unit.id, title: "Matematika Dasar 3", order: 3 },
          { unitId: unit.id, title: "Matematika Dasar 4", order: 4 },
          { unitId: unit.id, title: "Matematika Dasar 5", order: 5 },
        ])
        .returning();

      for (const lesson of lessons) {
        // ----- Insert challenges -----
        const challenges = await db
          .insert(schema.challenges)
          .values([
            {
              lessonId: lesson.id,
              type: "ASSIST",
              question: "17 - 13 =",
              order: 1,
            },
            {
              lessonId: lesson.id,
              type: "ASSIST",
              question: "26 - 13?",
              order: 2,
            },
            {
              lessonId: lesson.id,
              type: "ASSIST",
              question: "12 + 11?",
              order: 3,
            },
            {
              lessonId: lesson.id,
              type: "ASSIST",
              question: "31 - 12 =",
              order: 4,
            },
            {
              lessonId: lesson.id,
              type: "ASSIST",
              question: "22 + 17 =",
              order: 5,
            },
            {
              lessonId: lesson.id,
              type: "ASSIST",
              question: "3 x 3 =",
              order: 6,
            },
            {
              lessonId: lesson.id,
              type: "ASSIST",
              question: "4 x 6 =",
              order: 7,
            },
            {
              lessonId: lesson.id,
              type: "ASSIST",
              question: "7 x 3 =",
              order: 8,
            },
            {
              lessonId: lesson.id,
              type: "ASSIST",
              question: "8 x 2 =",
              order: 9,
            },
            {
              lessonId: lesson.id,
              type: "ASSIST",
              question: "3 x 6 =",
              order: 10,
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
        { correct: false, text: "3" },
        { correct: false, text: "2" },
        { correct: true, text: "4" },
        { correct: false, text: "5" },
      ];
    case 2:
      return [
        { correct: false, text: "15" },
        { correct: true, text: "13" },
        { correct: false, text: "14" },
        { correct: false, text: "17" },
      ];
    case 3:
      return [
        { correct: false, text: "21" },
        { correct: false, text: "24" },
        { correct: false, text: "22" },
        { correct: true, text: "23" },
      ];
    case 4:
      return [
        { correct: false, text: "18" },
        { correct: true, text: "19" },
        { correct: false, text: "20" },
        { correct: false, text: "17" },
      ];
    case 5:
      return [
        { correct: true, text: "39" },
        { correct: false, text: "38" },
        { correct: false, text: "40" },
        { correct: false, text: "41" },
      ];
    case 6:
      return [
        { correct: false, text: "6" },
        { correct: false, text: "12" },
        { correct: true, text: "9" },
        { correct: false, text: "3" },
      ];
    case 7:
      return [
        { correct: true, text: "24" },
        { correct: false, text: "26" },
        { correct: false, text: "28" },
        { correct: false, text: "20" },
      ];
    case 8:
      return [
        { correct: false, text: "18" },
        { correct: false, text: "22" },
        { correct: true, text: "21" },
        { correct: false, text: "24" },
      ];
    case 9:
      return [
        { correct: false, text: "20" },
        { correct: true, text: "16" },
        { correct: false, text: "18" },
        { correct: false, text: "14" },
      ];
    case 10:
      return [
        { correct: false, text: "19" },
        { correct: false, text: "22" },
        { correct: true, text: "18" },
        { correct: false, text: "24" },
      ];

    default:
      return [];
  }
}
