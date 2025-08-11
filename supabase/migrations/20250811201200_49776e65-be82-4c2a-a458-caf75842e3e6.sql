-- Seed data equivalent to scripts/seed.ts using .env.local values already configured
-- Cities
INSERT INTO public.cities (slug, name, country, region, summary, history_markdown, dialect_notes, notable_people, image_url, published)
VALUES
  ('tirana','Tirana','Albania','Central','Capital city since 1920; vibrant arts, cafés, and boulevards.','Founded in the 17th century; became Albania’s capital in 1920. Modern growth with colorful façades and public squares.','Standard Albanian (Tosk-based).', '{"Ismail Kadare"}', 'images/cities/tirane_placeholder.jpg', true),
  ('prishtina','Prishtina','Kosovo','Kosova','Administrative, cultural, and university center of Kosovo.','Ottoman period roots; major growth in the 20th century; post-1999 transformation.','Gheg is dominant; colloquial forms common in daily speech.','{"Nexhmije Pagarusha","Mira Murati"}', 'images/cities/prishtina_placeholder.jpg', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  country = EXCLUDED.country,
  region = EXCLUDED.region,
  summary = EXCLUDED.summary,
  history_markdown = EXCLUDED.history_markdown,
  dialect_notes = EXCLUDED.dialect_notes,
  notable_people = EXCLUDED.notable_people,
  image_url = EXCLUDED.image_url,
  published = EXCLUDED.published,
  updated_at = now();

-- Figures
INSERT INTO public.figures (slug, name, era, field, bio_markdown, impact_markdown, image_url, published)
VALUES
  ('gjergj-kastrioti-skanderbeg', 'Gjergj Kastrioti Skanderbeg', '15th century', 'National Leader', 'Military commander who led the League of Lezhë against the Ottoman Empire.', 'Symbol of resistance and unity; central to Albanian identity.', 'images/figures/skanderbeg_placeholder.jpg', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  era = EXCLUDED.era,
  field = EXCLUDED.field,
  bio_markdown = EXCLUDED.bio_markdown,
  impact_markdown = EXCLUDED.impact_markdown,
  image_url = EXCLUDED.image_url,
  published = EXCLUDED.published,
  updated_at = now();

-- Traditions
INSERT INTO public.traditions (slug, name, theme, summary, detail_markdown, etiquette_markdown, image_url, published)
VALUES
  ('besa', 'Besa', 'Ethics', 'A solemn pledge of honor and trust.', 'Besa underpins hospitality and protection of guests; historically vital in community relations.', 'Promises are kept; guests are honored.', 'images/traditions/besa_placeholder.jpg', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  theme = EXCLUDED.theme,
  summary = EXCLUDED.summary,
  detail_markdown = EXCLUDED.detail_markdown,
  etiquette_markdown = EXCLUDED.etiquette_markdown,
  image_url = EXCLUDED.image_url,
  published = EXCLUDED.published,
  updated_at = now();

-- Lessons (greetings-01)
INSERT INTO public.lessons (slug, title, level, summary, body_markdown, published, cover_image_url)
VALUES
  ('greetings-01', 'Greetings', 'beginner', 'Say hello and introduce yourself.', 'Start with simple greetings in both Gheg and Tosk.', true, 'images/lessons/greetings_placeholder.jpg')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  level = EXCLUDED.level,
  summary = EXCLUDED.summary,
  body_markdown = EXCLUDED.body_markdown,
  published = EXCLUDED.published,
  cover_image_url = EXCLUDED.cover_image_url,
  updated_at = now();

-- Remove existing lesson-related children for idempotency
WITH lr AS (
  SELECT id FROM public.lessons WHERE slug = 'greetings-01'
)
-- Delete quiz dependencies
, qz AS (
  SELECT id FROM public.quizzes WHERE ref_id = (SELECT id FROM lr) AND scope = 'lesson'
)
DELETE FROM public.answers a USING public.questions qq, qz
WHERE a.question_id = qq.id AND qq.quiz_id = qz.id;

WITH lr AS (
  SELECT id FROM public.lessons WHERE slug = 'greetings-01'
)
, qz AS (
  SELECT id FROM public.quizzes WHERE ref_id = (SELECT id FROM lr) AND scope = 'lesson'
)
DELETE FROM public.questions qq USING qz
WHERE qq.quiz_id = qz.id;

WITH lr AS (
  SELECT id FROM public.lessons WHERE slug = 'greetings-01'
)
DELETE FROM public.quizzes q WHERE q.ref_id = (SELECT id FROM lr) AND q.scope = 'lesson';

-- Delete dialogues and lines
WITH lr AS (
  SELECT id FROM public.lessons WHERE slug = 'greetings-01'
)
, d AS (
  SELECT id FROM public.dialogues WHERE lesson_id = (SELECT id FROM lr)
)
DELETE FROM public.dialogue_lines dl USING d
WHERE dl.dialogue_id = d.id;

WITH lr AS (
  SELECT id FROM public.lessons WHERE slug = 'greetings-01'
)
DELETE FROM public.dialogues WHERE lesson_id = (SELECT id FROM lr);

-- Delete grammar tips
WITH lr AS (
  SELECT id FROM public.lessons WHERE slug = 'greetings-01'
)
DELETE FROM public.grammar_tips WHERE lesson_id = (SELECT id FROM lr);

-- Delete vocab and variants
WITH lr AS (
  SELECT id FROM public.lessons WHERE slug = 'greetings-01'
)
, v AS (
  SELECT id FROM public.vocab WHERE lesson_id = (SELECT id FROM lr)
)
DELETE FROM public.vocab_variants vv USING v WHERE vv.vocab_id = v.id;

WITH lr AS (
  SELECT id FROM public.lessons WHERE slug = 'greetings-01'
)
DELETE FROM public.vocab WHERE lesson_id = (SELECT id FROM lr);

-- Insert vocab + variants
WITH lr AS (
  SELECT id FROM public.lessons WHERE slug = 'greetings-01'
), vrow AS (
  INSERT INTO public.vocab (lesson_id, base_term, eng_gloss, notes)
  SELECT id, 'Hello', 'Hello', 'Common greeting' FROM lr
  RETURNING id
)
INSERT INTO public.vocab_variants (vocab_id, dialect, phrase, ipa, audio_url)
SELECT id, 'gheg', 'Tung', 'tuŋ', 'audio/lessons/hello_gheg_placeholder.mp3' FROM vrow
UNION ALL
SELECT id, 'tosk', 'Përshëndetje', 'pərʃənˈdɛcjɛ', 'audio/lessons/hello_tosk_placeholder.mp3' FROM vrow;

-- Insert dialogues + lines
WITH lr AS (
  SELECT id FROM public.lessons WHERE slug = 'greetings-01'
), drow AS (
  INSERT INTO public.dialogues (lesson_id, title)
  SELECT id, 'Meeting someone' FROM lr
  RETURNING id
)
INSERT INTO public.dialogue_lines (dialogue_id, order_index, speaker, dialect, line, ipa, audio_url)
VALUES
  ((SELECT id FROM drow), 1, 'A', 'gheg', 'Tung! Si je?', 'tuŋ si jɛ', 'audio/lessons/line1_gheg_placeholder.mp3'),
  ((SELECT id FROM drow), 2, 'B', 'tosk', 'Përshëndetje! Si je?', 'pərʃənˈdɛcjɛ si jɛ', 'audio/lessons/line2_tosk_placeholder.mp3');

-- Insert grammar tips
WITH lr AS (
  SELECT id FROM public.lessons WHERE slug = 'greetings-01'
)
INSERT INTO public.grammar_tips (lesson_id, title, body_markdown)
SELECT id, 'Gheg vs Tosk greeting forms', 'Gheg often uses **Tung**; Tosk commonly uses **Përshëndetje**.' FROM lr;

-- Insert quiz + questions + answers
WITH lr AS (
  SELECT id FROM public.lessons WHERE slug = 'greetings-01'
), qrow AS (
  INSERT INTO public.quizzes (slug, title, scope, ref_id, published)
  SELECT 'greetings-01-quiz', 'Greetings Check', 'lesson', id, true FROM lr
  RETURNING id
), q1 AS (
  INSERT INTO public.questions (quiz_id, type, prompt, explanation)
  SELECT id, 'mcq', 'Tung is more typical of which dialect?', 'It’s common in Gheg.' FROM qrow
  RETURNING id
), a1 AS (
  INSERT INTO public.answers (question_id, label, is_correct)
  SELECT id, 'Gheg', true FROM q1
  UNION ALL
  SELECT id, 'Tosk', false FROM q1
  RETURNING question_id
), q2 AS (
  INSERT INTO public.questions (quiz_id, type, prompt, explanation)
  SELECT id, 'truefalse', 'Përshëndetje is Tosk-based standard.', 'Correct in standard contexts.' FROM qrow
  RETURNING id
)
INSERT INTO public.answers (question_id, label, is_correct)
SELECT id, 'True', true FROM q2
UNION ALL
SELECT id, 'False', false FROM q2;
