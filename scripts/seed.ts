// Seed script: reads JSON files in supabase/seed and upserts into Supabase tables
// Usage: pnpm ts-node scripts/seed.ts

import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Types for seed files
interface CitySeed {
  slug: string;
  name: string;
  country: string;
  region: string;
  summary: string;
  history_markdown: string;
  dialect_notes: string;
  notable_people: string[];
  image_url: string;
  published: boolean;
}

interface FigureSeed {
  slug: string;
  name: string;
  era: string;
  field: string;
  bio_markdown: string;
  impact_markdown: string;
  image_url: string;
  published: boolean;
}

interface TraditionSeed {
  slug: string;
  name: string;
  theme: string;
  summary: string;
  detail_markdown: string;
  etiquette_markdown: string;
  image_url: string;
  published: boolean;
}

interface VocabVariantSeed {
  dialect: "gheg" | "tosk";
  phrase: string;
  ipa?: string;
  audio_url?: string;
}

interface VocabSeed {
  base_term: string;
  eng_gloss: string;
  notes?: string;
  variants: VocabVariantSeed[];
}

interface DialogueLineSeed {
  order_index: number;
  speaker: string;
  dialect: "gheg" | "tosk";
  line: string;
  ipa?: string;
  audio_url?: string;
}

interface DialogueSeed {
  title: string;
  lines: DialogueLineSeed[];
}

interface GrammarTipSeed {
  title: string;
  body_markdown: string;
}

interface AnswerSeed { label: string; is_correct: boolean }
interface QuestionSeed {
  type: "mcq" | "truefalse" | "fill";
  prompt: string;
  explanation?: string;
  answers: AnswerSeed[];
}

interface QuizSeed { title: string; questions: QuestionSeed[] }

interface LessonSeed {
  slug: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  summary: string;
  body_markdown: string;
  published: boolean;
  cover_image_url?: string;
  vocab?: VocabSeed[];
  dialogues?: DialogueSeed[];
  grammar_tips?: GrammarTipSeed[];
  quiz?: QuizSeed;
}

const SEED_DIR = path.resolve(__dirname, "../supabase/seed");

function getEnv(name: string) {
  const val = process.env[name];
  if (!val) {
    console.error(`Missing env: ${name}`);
  }
  return val;
}

const SUPABASE_URL = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE_ROLE = getEnv("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running the seed script.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function readJsonFile<T>(fileName: string): Promise<T> {
  const full = path.join(SEED_DIR, fileName);
  const data = await readFile(full, "utf-8");
  return JSON.parse(data) as T;
}

async function seedSimpleTable<T extends Record<string, any>>(table: string, rows: T[], onConflict: string) {
  if (!rows?.length) return { count: 0 };
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table} upsert failed: ${error.message}`);
  return { count: rows.length };
}

async function seedCities() {
  const rows = await readJsonFile<CitySeed[]>("cities.json");
  const res = await seedSimpleTable("cities", rows, "slug");
  console.log(`Seeded cities: ${res.count}`);
}

async function seedFigures() {
  const rows = await readJsonFile<FigureSeed[]>("figures.json");
  const res = await seedSimpleTable("figures", rows, "slug");
  console.log(`Seeded figures: ${res.count}`);
}

async function seedTraditions() {
  const rows = await readJsonFile<TraditionSeed[]>("traditions.json");
  const res = await seedSimpleTable("traditions", rows, "slug");
  console.log(`Seeded traditions: ${res.count}`);
}

async function seedLessons() {
  const lessons = await readJsonFile<LessonSeed[]>("lessons.json");
  let totalVocab = 0;
  let totalVariants = 0;
  let totalDialogues = 0;
  let totalLines = 0;
  let totalTips = 0;
  let totalQuizzes = 0;
  let totalQuestions = 0;
  let totalAnswers = 0;

  for (const lesson of lessons) {
    // Upsert the lesson
    const { data: upData, error: upErr } = await supabase
      .from("lessons")
      .upsert([
        {
          slug: lesson.slug,
          title: lesson.title,
          level: lesson.level,
          summary: lesson.summary,
          body_markdown: lesson.body_markdown,
          published: lesson.published,
          cover_image_url: lesson.cover_image_url ?? null,
        },
      ], { onConflict: "slug" })
      .select("id, slug")
      .limit(1);

    if (upErr) throw new Error(`lessons upsert failed for ${lesson.slug}: ${upErr.message}`);
    const lessonId = upData?.[0]?.id as string;
    if (!lessonId) throw new Error(`Could not resolve lesson id for slug ${lesson.slug}`);

    // Wipe existing children for idempotency
    // vocab + variants
    const { data: vocabRows } = await supabase.from("vocab").select("id").eq("lesson_id", lessonId);
    const vocabIds = (vocabRows ?? []).map((r: any) => r.id);
    if (vocabIds.length) {
      await supabase.from("vocab_variants").delete().in("vocab_id", vocabIds);
      await supabase.from("vocab").delete().eq("lesson_id", lessonId);
    }

    // dialogues + lines
    const { data: dlgRows } = await supabase.from("dialogues").select("id").eq("lesson_id", lessonId);
    const dlgIds = (dlgRows ?? []).map((r: any) => r.id);
    if (dlgIds.length) {
      await supabase.from("dialogue_lines").delete().in("dialogue_id", dlgIds);
      await supabase.from("dialogues").delete().eq("lesson_id", lessonId);
    }

    // grammar tips
    await supabase.from("grammar_tips").delete().eq("lesson_id", lessonId);

    // quizzes (+ questions/answers)
    const { data: quizRows } = await supabase
      .from("quizzes")
      .select("id")
      .eq("scope", "lesson")
      .eq("ref_id", lessonId);
    const quizIds = (quizRows ?? []).map((r: any) => r.id);
    if (quizIds.length) {
      // delete answers of questions for these quizzes
      const { data: qRows } = await supabase.from("questions").select("id").in("quiz_id", quizIds);
      const qIds = (qRows ?? []).map((r: any) => r.id);
      if (qIds.length) await supabase.from("answers").delete().in("question_id", qIds);
      await supabase.from("questions").delete().in("id", qIds);
      await supabase.from("quizzes").delete().in("id", quizIds);
    }

    // Insert vocab and variants
    if (lesson.vocab?.length) {
      for (const v of lesson.vocab) {
        const { data: vInsert, error: vErr } = await supabase
          .from("vocab")
          .insert([{ lesson_id: lessonId, base_term: v.base_term, eng_gloss: v.eng_gloss, notes: v.notes ?? null }])
          .select("id")
          .limit(1);
        if (vErr) throw new Error(`vocab insert failed for ${lesson.slug}/${v.base_term}: ${vErr.message}`);
        const vocabId = vInsert?.[0]?.id as string;
        totalVocab += 1;
        if (v.variants?.length) {
          const variantsPayload = v.variants.map((vv) => ({
            vocab_id: vocabId,
            dialect: vv.dialect,
            phrase: vv.phrase,
            ipa: vv.ipa ?? null,
            audio_url: vv.audio_url ?? null,
          }));
          const { error: vvErr } = await supabase.from("vocab_variants").insert(variantsPayload);
          if (vvErr) throw new Error(`vocab_variants insert failed for ${lesson.slug}/${v.base_term}: ${vvErr.message}`);
          totalVariants += variantsPayload.length;
        }
      }
    }

    // Insert dialogues and lines
    if (lesson.dialogues?.length) {
      for (const d of lesson.dialogues) {
        const { data: dInsert, error: dErr } = await supabase
          .from("dialogues")
          .insert([{ lesson_id: lessonId, title: d.title }])
          .select("id")
          .limit(1);
        if (dErr) throw new Error(`dialogues insert failed for ${lesson.slug}/${d.title}: ${dErr.message}`);
        const dialogueId = dInsert?.[0]?.id as string;
        totalDialogues += 1;
        if (d.lines?.length) {
          const linesPayload = d.lines.map((ln) => ({
            dialogue_id: dialogueId,
            order_index: ln.order_index,
            speaker: ln.speaker,
            dialect: ln.dialect,
            line: ln.line,
            ipa: ln.ipa ?? null,
            audio_url: ln.audio_url ?? null,
          }));
          const { error: lErr } = await supabase.from("dialogue_lines").insert(linesPayload);
          if (lErr) throw new Error(`dialogue_lines insert failed for ${lesson.slug}/${d.title}: ${lErr.message}`);
          totalLines += linesPayload.length;
        }
      }
    }

    // Insert grammar tips
    if (lesson.grammar_tips?.length) {
      const tipsPayload = lesson.grammar_tips.map((gt) => ({
        lesson_id: lessonId,
        title: gt.title,
        body_markdown: gt.body_markdown,
      }));
      const { error: gtErr } = await supabase.from("grammar_tips").insert(tipsPayload);
      if (gtErr) throw new Error(`grammar_tips insert failed for ${lesson.slug}: ${gtErr.message}`);
      totalTips += tipsPayload.length;
    }

    // Insert quiz, questions, answers
    if (lesson.quiz) {
      const quizSlug = `${lesson.slug}-quiz`;
      const { data: qzUp, error: qzErr } = await supabase
        .from("quizzes")
        .upsert([{ slug: quizSlug, scope: "lesson", ref_id: lessonId, title: lesson.quiz.title, published: true }], { onConflict: "slug" })
        .select("id")
        .limit(1);
      if (qzErr) throw new Error(`quizzes upsert failed for ${lesson.slug}: ${qzErr.message}`);
      const quizId = qzUp?.[0]?.id as string;
      totalQuizzes += 1;

      if (lesson.quiz.questions?.length) {
        for (const q of lesson.quiz.questions) {
          const { data: qIns, error: qErr } = await supabase
            .from("questions")
            .insert([{ quiz_id: quizId, type: q.type, prompt: q.prompt, explanation: q.explanation ?? null }])
            .select("id")
            .limit(1);
          if (qErr) throw new Error(`questions insert failed for ${lesson.slug}: ${qErr.message}`);
          const questionId = qIns?.[0]?.id as string;
          totalQuestions += 1;

          if (q.answers?.length) {
            const ansPayload = q.answers.map((a) => ({ question_id: questionId, label: a.label, is_correct: a.is_correct }));
            const { error: aErr } = await supabase.from("answers").insert(ansPayload);
            if (aErr) throw new Error(`answers insert failed for ${lesson.slug}: ${aErr.message}`);
            totalAnswers += ansPayload.length;
          }
        }
      }
    }
  }

  console.log(
    `Seeded lessons: ${lessons.length} | vocab: ${totalVocab} variants: ${totalVariants} | dialogues: ${totalDialogues} lines: ${totalLines} | tips: ${totalTips} | quizzes: ${totalQuizzes} questions: ${totalQuestions} answers: ${totalAnswers}`
  );
}

async function main() {
  try {
    await seedCities();
    await seedFigures();
    await seedTraditions();
    await seedLessons();
    console.log("Seeding completed successfully.");
  } catch (err: any) {
    console.error("Seeding failed:", err?.message ?? err);
    process.exitCode = 1;
  }
}

main();
