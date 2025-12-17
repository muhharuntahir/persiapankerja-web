// scripts/test.ts
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";

// Supabase Pooler (WAJIB prepare:false)
const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client, { schema });

async function main() {
  try {
    console.log("🚀 Seeding CPNS SKD TIU...");

    // =============================
    // 1. INSERT COURSE
    // =============================
    const [course] = await db
      .insert(schema.courses)
      .values({
        title: "CPNS",
        imageSrc: "/cpns.svg",
      })
      .returning();

    // =============================
    // 2. INSERT UNIT
    // =============================
    const [unit] = await db
      .insert(schema.units)
      .values({
        courseId: course.id,
        title: "SKD – TIU",
        slug: "skd-tiu",
        description: "Tes Intelegensia Umum (Sinonim, Antonim, Analogi)",
        order: 1,
      })
      .returning();

    // =============================
    // 3. INSERT LESSON
    // =============================
    const [lesson] = await db
      .insert(schema.lessons)
      .values({
        unitId: unit.id,
        title: "Sinonim, Antonim & Analogi",
        order: 1,
      })
      .returning();

    // =============================
    // 4. INSERT CHALLENGES
    // =============================
    const challenges = await db
      .insert(schema.challenges)
      .values([
        {
          lessonId: lesson.id,
          type: "ASSIST",
          order: 1,
          question: "Friksi = ...",
        },
        {
          lessonId: lesson.id,
          type: "ASSIST",
          order: 2,
          question: "Rabun >< ...",
        },
        {
          lessonId: lesson.id,
          type: "ASSIST",
          order: 3,
          question: "Surai >< ...",
        },
        {
          lessonId: lesson.id,
          type: "ASSIST",
          order: 4,
          question: "Penerus >< ...",
        },
        {
          lessonId: lesson.id,
          type: "ASSIST",
          order: 5,
          question: "Mortalitas = ...",
        },
        {
          lessonId: lesson.id,
          type: "ASSIST",
          order: 6,
          question: "Anjung = ...",
        },
        {
          lessonId: lesson.id,
          type: "ASSIST",
          order: 7,
          question: "Mana yang tidak termasuk kelompoknya?",
        },
        {
          lessonId: lesson.id,
          type: "ASSIST",
          order: 8,
          question: "Laut : ... = Kabupaten : ...",
        },
        {
          lessonId: lesson.id,
          type: "ASSIST",
          order: 9,
          question: "Bulan : Bumi = Bumi : ...",
        },
        {
          lessonId: lesson.id,
          type: "ASSIST",
          order: 10,
          question: "BEBATUAN terhadap Geologi seperti BENIH terhadap ...",
        },
      ])
      .returning();

    // =============================
    // 5. INSERT OPTIONS
    // =============================
    const optionsMap = [
      // 1
      [
        ["Perpecahan", true],
        ["Tidak berdaya", false],
        ["Frustasi", false],
        ["Sedih", false],
        ["Putus harapan", false],
      ],
      // 2
      [
        ["Jelas", true],
        ["Tajam", false],
        ["Terang", false],
        ["Tepat", false],
        ["Samar", false],
      ],
      // 3
      [
        ["Berhimpun", true],
        ["Bubar", false],
        ["Usai", false],
        ["Purna", false],
        ["Akhir", false],
      ],
      // 4
      [
        ["Perintis", true],
        ["Pewaris", false],
        ["Kader", false],
        ["Titisan", false],
        ["Penemu", false],
      ],
      // 5
      [
        ["Angka kematian", true],
        ["Angka kelahiran", false],
        ["Sebangsa hewan", false],
        ["Gerak", false],
        ["Pukulan", false],
      ],
      // 6
      [
        ["Panggung", true],
        ["Dayung", false],
        ["Buyung", false],
        ["Puji", false],
        ["Angkat", false],
      ],
      // 7
      [
        ["Angklung", true],
        ["Srimpi", false],
        ["Kecak", false],
        ["Pendet", false],
        ["Jaipong", false],
      ],
      // 8
      [
        ["Samudera – Provinsi", true],
        ["Pulau – Peta", false],
        ["Ikan – Daerah", false],
        ["Air – Wilayah", false],
        ["Nelayan – Bupati", false],
      ],
      // 9
      [
        ["Matahari", true],
        ["Tata surya", false],
        ["Planet", false],
        ["Bintang", false],
        ["Bulan", false],
      ],
      // 10
      [
        ["Hortikultura", true],
        ["Ilmu pengetahuan", false],
        ["Biologi", false],
        ["Atom", false],
        ["Batu", false],
      ],
    ];

    for (let i = 0; i < challenges.length; i++) {
      await db.insert(schema.challengeOptions).values(
        optionsMap[i].map(([text, correct]) => ({
          challengeId: challenges[i].id,
          text: text as string,
          correct: correct as boolean,
        }))
      );
    }

    console.log("✅ CPNS SKD TIU berhasil di-seed!");
  } catch (err) {
    console.error("❌ Error seeding:", err);
  } finally {
    await client.end();
  }
}

main();
