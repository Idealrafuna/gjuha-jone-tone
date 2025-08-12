import { useEffect, useMemo, useState } from "react";
import { Seo } from "@/components/Seo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import VoiceButton from "@/components/VoiceButton";
import { supabase } from "@/integrations/supabase/client";

// Types
export type Dialect = "gheg" | "tosk";
export type Level = "beginner" | "intermediate" | "advanced";

export type Lesson = {
  id: string;
  slug: string;
  title_tosk: string;
  title_gheg: string;
  level: Level | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  order?: number | null;
  published?: boolean | null;
};

export type CardItem = {
  id: string;
  lesson_id: string;
  albanian_tosk: string;
  albanian_gheg: string;
  english: string;
  ipa?: string | null;
};

function normalizeLevel(input: Lesson["level"]): Level {
  const v = String(input || "").toLowerCase();
  if (v === "beginner" || v === "intermediate" || v === "advanced") return v as Level;
  if (v === "a1" || v === "a2") return "beginner";
  if (v === "b1" || v === "b2") return "intermediate";
  if (v === "c1" || v === "c2") return "advanced";
  // default to beginner if unknown
  return "beginner";
}

function pickByDialect(dialect: Dialect, gheg: string, tosk: string) {
  return dialect === "gheg" ? (gheg || tosk) : (tosk || gheg);
}

const allLevels: Level[] = ["beginner", "intermediate", "advanced"];

const LessonsPage = () => {
  const [dialect, setDialect] = useState<Dialect>("tosk");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLevel, setSelectedLevel] = useState<Level>("beginner");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Load dialect from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dialect");
      if (stored === "gheg" || stored === "tosk") setDialect(stored);
    } catch {}
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const client = supabase as any; // temporary type bypass around queries
        // Try with published filter first
        let lessonsQuery = client
          .from("lessons")
          .select("id, slug, title_tosk, title_gheg, level, order, published");

        // Attempt to filter by published if the column exists
        let lessonsResp = await lessonsQuery.eq("published", true);
        if (lessonsResp.error && String(lessonsResp.error.message || "").toLowerCase().includes("column") && String(lessonsResp.error.message || "").toLowerCase().includes("published")) {
          // Retry without the published filter if column doesn't exist
          lessonsResp = await client
            .from("lessons")
            .select("id, slug, title_tosk, title_gheg, level, order, published");
        }

        if (lessonsResp.error) throw lessonsResp.error;
        const rawLessons: Lesson[] = lessonsResp.data || [];

        // Fetch cards (prefer 'cards' table; fallback to building from vocab + vocab_variants if missing)
        let builtCards: CardItem[] = [];
        const cardsResp = await client
          .from("cards")
          .select("id, lesson_id, albanian_tosk, albanian_gheg, english, ipa");

        if (cardsResp.error) {
          const msg = String(cardsResp.error.message || "").toLowerCase();
          const isMissing = msg.includes("relation") && msg.includes("cards");
          if (!isMissing) throw cardsResp.error;

          // Fallback: compose cards from vocab + variants
          const vocabResp = await client
            .from("vocab")
            .select("id, lesson_id, eng_gloss");
          if (vocabResp.error) throw vocabResp.error;
          const vrows = vocabResp.data || [];
          const vIds = vrows.map((v: any) => v.id);
          let variantsByVocab: Record<string, any[]> = {};
          if (vIds.length > 0) {
            const variantsResp = await client
              .from("vocab_variants")
              .select("vocab_id, dialect, phrase, ipa")
              .in("vocab_id", vIds);
            if (!variantsResp.error && variantsResp.data) {
              for (const vv of variantsResp.data) {
                variantsByVocab[vv.vocab_id] = [...(variantsByVocab[vv.vocab_id] || []), vv];
              }
            }
          }
          builtCards = vrows.map((v: any) => {
            const variants = variantsByVocab[v.id] || [];
            const ghegVar = variants.find((x: any) => (x.dialect || "").toLowerCase() === "gheg");
            const toskVar = variants.find((x: any) => (x.dialect || "").toLowerCase() === "tosk");
            return {
              id: v.id,
              lesson_id: v.lesson_id,
              albanian_tosk: (toskVar?.phrase || ""),
              albanian_gheg: (ghegVar?.phrase || ""),
              english: v.eng_gloss,
              ipa: toskVar?.ipa || ghegVar?.ipa || null,
            } as CardItem;
          });
        } else {
          builtCards = cardsResp.data || [];
        }

        // Sort lessons by order then title (client-side to be safe if 'order' column is missing)
        const sortedLessons = [...rawLessons].sort((a, b) => {
          const ao = a.order ?? Number.POSITIVE_INFINITY;
          const bo = b.order ?? Number.POSITIVE_INFINITY;
          if (ao !== bo) return ao - bo;
          const at = (a.title_tosk || a.title_gheg || "").toLowerCase();
          const bt = (b.title_tosk || b.title_gheg || "").toLowerCase();
          return at.localeCompare(bt);
        });

        setLessons(sortedLessons);
        setCards(builtCards);
      } catch (e: any) {
        setError(e.message || "Failed to load lessons");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const lessonsByLevel = useMemo(() => {
    const by: Record<Level, Lesson[]> = { beginner: [], intermediate: [], advanced: [] };
    lessons.forEach((l) => by[normalizeLevel(l.level)].push(l));
    return by;
  }, [lessons]);

  // Determine default selections when lessons load
  useEffect(() => {
    if (lessons.length === 0) return;
    const firstNonEmptyLevel = allLevels.find((lvl) => lessonsByLevel[lvl].length > 0) || "beginner";
    setSelectedLevel(firstNonEmptyLevel);
    const firstLesson = lessonsByLevel[firstNonEmptyLevel][0];
    setSelectedLessonId(firstLesson ? firstLesson.id : null);
  }, [lessons, lessonsByLevel]);

  // When changing level, auto-select its first lesson
  useEffect(() => {
    const first = lessonsByLevel[selectedLevel]?.[0];
    setSelectedLessonId(first ? first.id : null);
  }, [selectedLevel, lessonsByLevel]);

  const currentLevelLessons = lessonsByLevel[selectedLevel] || [];
  const filteredCards = useMemo(
    () => (selectedLessonId ? cards.filter((c) => c.lesson_id === selectedLessonId) : []),
    [cards, selectedLessonId]
  );

  return (
    <main className="container mx-auto max-w-5xl p-4 space-y-6">
      <Seo title="Lessons" description="Browse lessons by level with Gheg/Tosk variants." canonical="/learn" />

      <div className="text-sm text-muted-foreground">Dialect: {dialect === "gheg" ? "Gheg" : "Tosk"}</div>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-destructive">Error: {error}</p>}

      {!loading && !error && lessons.length === 0 && (
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-1">No lessons yet</h3>
            <p className="text-sm text-muted-foreground">Check back soon.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && lessons.length > 0 && (
        <Tabs value={selectedLevel} onValueChange={(v) => setSelectedLevel(v as Level)}>
          <TabsList className="mb-2">
            <TabsTrigger value="beginner">Beginner</TabsTrigger>
            <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedLevel}>
            {currentLevelLessons.length === 0 ? (
              <Card className="rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-1">No lessons yet for this level</h3>
                  <p className="text-sm text-muted-foreground">Choose another level.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Horizontally scrollable sub-tabs */}
                <Tabs value={selectedLessonId ?? undefined} onValueChange={(v) => setSelectedLessonId(v)}>
                  <TabsList className="w-full overflow-x-auto whitespace-nowrap">
                    {currentLevelLessons.map((l) => (
                      <TabsTrigger key={l.id} value={l.id} className="px-3">
                        {pickByDialect(dialect, l.title_gheg, l.title_tosk)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div>
                  <div className="mb-2 text-sm text-muted-foreground flex items-center gap-2">
                    <span>Lesson progress</span>
                    <Badge variant="secondary">100%</Badge>
                  </div>
                  {/* TODO: wire to review data */}
                  <Progress value={100} />
                </div>

                {filteredCards.length === 0 ? (
                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-1">No cards yet for this lesson</h3>
                      <p className="text-sm text-muted-foreground">Please check another lesson.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {filteredCards.map((c) => (
                      <Card key={c.id} className="rounded-2xl">
                        <CardContent className="p-4 flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold">
                              {pickByDialect(dialect, c.albanian_gheg, c.albanian_tosk)}
                            </div>
                            <div className="text-sm text-muted-foreground">{c.english}</div>
                            {c.ipa ? (
                              <div className="text-xs text-muted-foreground mt-1">/{c.ipa}/</div>
                            ) : null}
                          </div>
                          <VoiceButton />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
};

export default LessonsPage;
