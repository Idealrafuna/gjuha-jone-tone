import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import VoiceButton from "@/components/VoiceButton";
import { AccessGate } from "@/components/AccessGate";
import { useAccessControl } from "@/hooks/useAccessControl";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Play, Lock } from "lucide-react";

// Types
export type Dialect = "gheg" | "tosk";
export type Level = "beginner" | "intermediate" | "advanced";

export type Lesson = {
  id: string;
  slug: string;
  title: string;
  level: Level;
  published: boolean;
};

export type Variant = {
  dialect: Dialect;
  phrase: string;
  ipa?: string | null;
  audio_url?: string | null;
};

export type VocabRow = {
  id: string;
  lesson_id: string;
  base_term: string;
  eng_gloss: string;
  notes?: string | null;
  vocab_variants?: Variant[];
};

export default function LessonsPage() {
  const dialect: Dialect = (localStorage.getItem("dialect") as Dialect) || "tosk";
  const { isPremium, checkLessonAccess, checkVocabAccess, freeLimits } = useAccessControl();

  const [level, setLevel] = useState<Level>("beginner");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [errorLessons, setErrorLessons] = useState<string | null>(null);

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [vocab, setVocab] = useState<VocabRow[]>([]);
  const [loadingVocab, setLoadingVocab] = useState(false);
  const [errorVocab, setErrorVocab] = useState<string | null>(null);

  // Load lessons (published only)
  useEffect(() => {
    let cancelled = false;
    async function loadLessons() {
      setLoadingLessons(true);
      setErrorLessons(null);
      const { data, error } = await supabase
        .from("lessons")
        .select("id, slug, title, level, published")
        .eq("published", true)
        .order("title", { ascending: true });
      
      console.log("LESSONS:", data, error);

      if (cancelled) return;
      if (error) {
        setErrorLessons(error.message);
        setLessons([]);
      } else {
        setLessons((data ?? []) as Lesson[]);
      }
      setLoadingLessons(false);
    }
    loadLessons();
    return () => {
      cancelled = true;
    };
  }, []);

  // Group by level
  const byLevel = useMemo<Record<Level, Lesson[]>>(() => {
    const g: Record<Level, Lesson[]> = {
      beginner: [],
      intermediate: [],
      advanced: [],
    };
    for (const l of lessons) g[l.level]?.push(l);
    return g;
  }, [lessons]);

  // When level changes, pick first lesson in that level
  useEffect(() => {
    const first = byLevel[level][0]?.id ?? null;
    setActiveLessonId(first);
  }, [level, byLevel]);

  // Load vocab for active lesson
  useEffect(() => {
    if (!activeLessonId) {
      setVocab([]);
      return;
    }
    let cancelled = false;
    async function loadVocab() {
      setLoadingVocab(true);
      setErrorVocab(null);
      const { data, error } = await supabase
        .from("vocab")
        .select(
          `
          id, lesson_id, base_term, eng_gloss, notes,
          vocab_variants ( dialect, phrase, ipa, audio_url )
        `
        )
        .eq("lesson_id", activeLessonId);
      
      console.log("VOCAB:", data, error);

      if (cancelled) return;
      if (error) {
        setErrorVocab(error.message);
        setVocab([]);
      } else {
        setVocab((data ?? []) as VocabRow[]);
      }
      setLoadingVocab(false);
    }
    loadVocab();
    return () => {
      cancelled = true;
    };
  }, [activeLessonId]);

  const activeLessons = byLevel[level];
  const dialectLabel = dialect === "gheg" ? "Gheg" : "Tosk";

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
      <header className="rounded-2xl bg-gradient-to-r from-[hsl(var(--primary)/0.06)] to-[hsl(var(--primary)/0.12)] p-5">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold">Lessons</h1>
          <Badge variant="outline" className="text-xs sm:text-sm">Dialect: {dialectLabel}</Badge>
        </div>
      </header>

      {/* Level Tabs */}
      <Tabs value={level} onValueChange={(v) => setLevel(v as Level)}>
        <TabsList className="inline-flex w-full justify-center rounded-full bg-background/70 backdrop-blur p-1">
          <TabsTrigger className="rounded-full font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" value="beginner">Beginner</TabsTrigger>
          <TabsTrigger className="rounded-full font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" value="intermediate">Intermediate</TabsTrigger>
          <TabsTrigger className="rounded-full font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Content per level */}
        {(["beginner", "intermediate", "advanced"] as Level[]).map((lvl) => (
          <TabsContent key={lvl} value={lvl} className="mt-4 space-y-4">
            {loadingLessons ? (
              <Card className="rounded-2xl">
                <CardContent className="p-6 text-sm text-muted-foreground">Loading lessons…</CardContent>
              </Card>
            ) : errorLessons ? (
              <Card className="rounded-2xl">
                <CardContent className="p-6 text-sm text-destructive">{errorLessons}</CardContent>
              </Card>
            ) : activeLessons.length === 0 ? (
              <Card className="rounded-2xl">
                <CardContent className="p-6 text-sm text-muted-foreground flex items-center justify-between">
                  <span>No lessons yet for this level.</span>
                  <a
                    onClick={() => {
                      const levels: Level[] = ['beginner','intermediate','advanced'];
                      const next = levels.find((lv) => lv !== level && byLevel[lv]?.length > 0);
                      if (next) setLevel(next);
                    }}
                    className="text-sm font-medium underline cursor-pointer"
                  >
                    Explore other levels
                  </a>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Sub-tabs for lessons in this level */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <LessonSubTabs
                      lessons={activeLessons}
                      activeLessonId={activeLessonId}
                      onChange={setActiveLessonId}
                      checkLessonAccess={checkLessonAccess}
                    />
                  </div>
                  {activeLessonId && (
                    <Link to={`/learn/${activeLessons.find(l => l.id === activeLessonId)?.slug}/practice`}>
                      <Button size="sm" className="gap-2 ml-4">
                        <Play className="h-3 w-3" />
                        Practice
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Progress bar (placeholder 100%) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Lesson progress</div>
                    <div className="text-sm font-medium">100%</div>
                  </div>
                  <Progress value={100} className="h-3 bg-muted" />
                </div>

                {/* Vocab list */}
                {loadingVocab ? (
                  <Card className="rounded-2xl">
                    <CardContent className="p-6 text-sm text-muted-foreground">Loading cards…</CardContent>
                  </Card>
                ) : errorVocab ? (
                  <Card className="rounded-2xl">
                    <CardContent className="p-6 text-sm text-destructive">{errorVocab}</CardContent>
                  </Card>
                ) : vocab.length === 0 ? (
                  <Card className="rounded-2xl">
                    <CardContent className="p-6 text-sm text-muted-foreground">No cards yet for this lesson.</CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {vocab.map((row, vocabIndex) => {
                      const picked = pickVariant(row, dialect);
                      const hasVocabAccess = checkVocabAccess(vocabIndex);
                      const activeLesson = activeLessons.find(l => l.id === activeLessonId);
                      const lessonIndex = activeLessons.findIndex(l => l.id === activeLessonId);
                      const hasLessonAccess = checkLessonAccess(lessonIndex);
                      
                      return (
                        <AccessGate
                          key={row.id}
                          type="vocab"
                          index={vocabIndex}
                          itemName={`${picked.phrase} (${row.eng_gloss})`}
                          className={hasVocabAccess || hasLessonAccess ? "border-none shadow-none bg-transparent p-0" : ""}
                        >
                          <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow h-full">
                            <CardContent className="p-4 flex items-start justify-between gap-3">
                              <div>
                                <div className="font-semibold text-xl">{picked.phrase}</div>
                                <div className="text-sm text-muted-foreground">
                                  EN: {row.eng_gloss}
                                  {picked.ipa && <span className="ml-2 text-xs">/{picked.ipa}/</span>}
                                </div>
                              </div>
                              {(hasVocabAccess || hasLessonAccess) && <VoiceButton />}
                            </CardContent>
                          </Card>
                        </AccessGate>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function pickVariant(row: VocabRow, dialect: Dialect) {
  const list = row.vocab_variants ?? [];
  const exact = list.find((v) => v.dialect === dialect);
  const backup = list[0];
  return {
    phrase: exact?.phrase ?? backup?.phrase ?? row.base_term,
    ipa: exact?.ipa ?? backup?.ipa ?? null,
    audio: exact?.audio_url ?? null,
  };
}

function LessonSubTabs({
  lessons,
  activeLessonId,
  onChange,
  checkLessonAccess,
}: {
  lessons: Lesson[];
  activeLessonId: string | null;
  onChange: (id: string) => void;
  checkLessonAccess: (index: number) => boolean;
}) {
  const value = activeLessonId ?? (lessons[0]?.id ?? "");
  return (
    <Tabs value={value} onValueChange={onChange} onKeyDown={(e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const idx = lessons.findIndex((l) => l.id === value);
        if (idx > -1) {
          const next = e.key === 'ArrowRight'
            ? lessons[(idx + 1) % lessons.length].id
            : lessons[(idx - 1 + lessons.length) % lessons.length].id;
          onChange(next);
        }
      }
    }}>
      <TabsList className="sticky top-14 z-10 bg-background/80 backdrop-blur rounded-xl w-full px-2">
        {lessons.map((l, index) => {
          const hasAccess = checkLessonAccess(index);
          return (
            <TabsTrigger 
              key={l.id} 
              value={l.id} 
              disabled={!hasAccess}
              className={`whitespace-nowrap rounded-full font-medium data-[state=active]:bg-muted ${
                !hasAccess ? "opacity-50" : ""
              }`}
            >
              {l.title}
              {!hasAccess && <Lock className="ml-1 h-3 w-3" />}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {lessons.map((l) => (
        <TabsContent key={l.id} value={l.id} />
      ))}
    </Tabs>
  );
}
