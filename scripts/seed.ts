// scripts/seed.ts
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "../db/schema";

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("🌱 Seeding database...");

    // Hapus semua data lama
    await db.delete(schema.challengeOptions);
    await db.delete(schema.challengeProgress);
    await db.delete(schema.challenges);
    await db.delete(schema.lessons);
    await db.delete(schema.units);
    await db.delete(schema.userProgress);
    await db.delete(schema.userSubscription);
    await db.delete(schema.courses);

    // Insert courses
    await db.insert(schema.courses).values([
      { id: 1, title: "Spanish", imageSrc: "/es.svg" },
      { id: 2, title: "Italian", imageSrc: "/it.svg" },
      { id: 3, title: "French", imageSrc: "/fr.svg" },
      { id: 4, title: "Croatian", imageSrc: "/hr.svg" },
    ]);

    // Units
    await db.insert(schema.units).values([
      {
        id: 1,
        courseId: 1,
        title: "Unit 1",
        description: "Learn the basics of Spanish",
        order: 1,
      },
    ]);

    // Lessons
    await db.insert(schema.lessons).values([
      { id: 1, unitId: 1, order: 1, title: "Nouns" },
      { id: 2, unitId: 1, order: 2, title: "Verbs" },
      { id: 3, unitId: 1, order: 3, title: "Verbs" },
      { id: 4, unitId: 1, order: 4, title: "Verbs" },
      { id: 5, unitId: 1, order: 5, title: "Verbs" },
    ]);

    // Challenges for lesson 1
    await db.insert(schema.challenges).values([
      {
        id: 1,
        lessonId: 1,
        type: "SELECT",
        order: 1,
        question: 'Which one of these is "the man"?',
      },
      {
        id: 2,
        lessonId: 1,
        type: "ASSIST",
        order: 2,
        question: '"the man"',
      },
      {
        id: 3,
        lessonId: 1,
        type: "SELECT",
        order: 3,
        question: 'Which one of these is "the robot"?',
      },
    ]);

    // Challenge options (examples)
    await db.insert(schema.challengeOptions).values([
      // challenge 1
      {
        challengeId: 1,
        imageSrc: "/man.svg",
        correct: true,
        text: "el hombre",
        audioSrc: "/es_man.mp3",
      },
      {
        challengeId: 1,
        imageSrc: "/woman.svg",
        correct: false,
        text: "la mujer",
        audioSrc: "/es_woman.mp3",
      },
      {
        challengeId: 1,
        imageSrc: "/robot.svg",
        correct: false,
        text: "el robot",
        audioSrc: "/es_robot.mp3",
      },
    ]);

    await db.insert(schema.challengeOptions).values([
      // challenge 2
      {
        challengeId: 2,
        correct: true,
        text: "el hombre",
        audioSrc: "/es_man.mp3",
      },
      {
        challengeId: 2,
        correct: false,
        text: "la mujer",
        audioSrc: "/es_woman.mp3",
      },
      {
        challengeId: 2,
        correct: false,
        text: "el robot",
        audioSrc: "/es_robot.mp3",
      },
    ]);

    await db.insert(schema.challengeOptions).values([
      // challenge 3
      {
        challengeId: 3,
        imageSrc: "/man.svg",
        correct: false,
        text: "el hombre",
        audioSrc: "/es_man.mp3",
      },
      {
        challengeId: 3,
        imageSrc: "/woman.svg",
        correct: false,
        text: "la mujer",
        audioSrc: "/es_woman.mp3",
      },
      {
        challengeId: 3,
        imageSrc: "/robot.svg",
        correct: true,
        text: "el robot",
        audioSrc: "/es_robot.mp3",
      },
    ]);

    console.log("✅ Seeding finished successfully!");

    await sql.end();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    await sql.end();
    process.exit(1);
  }
};

main();
