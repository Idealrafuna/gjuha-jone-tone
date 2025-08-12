/*
  Seed only lessons into Supabase from supabase/seed/lessons.json
  Usage:
    npx tsx scripts/seed-lessons.ts
*/

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// Shape of each lesson entry in the JSON file
interface LessonJSON {
  slug: string;
  title: string;
  level: string; // enum in DB (e.g., 'beginner' | 'intermediate' | 'advanced')
  summary?: string | null;
  body_markdown?: string | null;
  published?: boolean;
  cover_image_url?: string | null;
  vocab?: unknown | null;
  dialogues?: unknown | null;
  grammar_tips?: unknown | null;
  quiz?: unknown | null;
}

(async () => {
  try {
    // Read lessons file
    const lessonsPath = path.resolve(process.cwd(), 'supabase/seed/lessons.json');
    const raw = fs.readFileSync(lessonsPath, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      throw new Error('Expected lessons.json to contain an array');
    }

    const input = parsed as LessonJSON[];

    // Map to the exact fields we want to upsert
    const rows = input.map((l) => ({
      slug: l.slug,
      title: l.title,
      level: l.level,
      summary: l.summary ?? null,
      body_markdown: l.body_markdown ?? null,
      published: Boolean(l.published),
      cover_image_url: l.cover_image_url ?? null,
      vocab: l.vocab ?? null,
      dialogues: l.dialogues ?? null,
      grammar_tips: l.grammar_tips ?? null,
      quiz: l.quiz ?? null,
    }));

    // Env vars (support both SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL for convenience)
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY in environment');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Upsert with conflict on slug
    const { data, error } = await supabase
      .from('lessons')
      .upsert(rows, { onConflict: 'slug' })
      .select('slug');

    if (error) throw error;

    const slugs = (data ?? []).map((d: { slug: string }) => d.slug);
    console.log(`Seeded lessons (count=${slugs.length}): ${slugs.join(', ')}`);
  } catch (err) {
    console.error('Failed to seed lessons:', err);
    process.exit(1);
  }
})();
