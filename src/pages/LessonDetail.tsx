import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/BackButton";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface Lesson {
  id: string;
  slug: string;
  title: string;
  level: string;
  summary: string;
  body_markdown: string;
  cover_image_url: string | null;
  published: boolean;
}

const LessonDetail = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [vocab, setVocab] = useState<any[]>([]);
  const [variantsByVocab, setVariantsByVocab] = useState<Record<string, any[]>>({});
  const [dialogues, setDialogues] = useState<any[]>([]);
  const [linesByDialogue, setLinesByDialogue] = useState<Record<string, any[]>>({});
  const [grammar, setGrammar] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const client = supabase as any; // temp types bypass
        const { data: lessonData, error: lessonErr } = await client
          .from('lessons')
          .select('id, slug, title, level, summary, body_markdown, cover_image_url, published')
          .eq('slug', slug)
          .single();
        if (lessonErr || !lessonData || !lessonData.published) {
          setError('Not found');
          setLoading(false);
          return;
        }
        setLesson(lessonData);

        // child resources
        const [vocabRes, dialoguesRes, grammarRes, quizzesRes] = await Promise.all([
          client.from('vocab').select('id, base_term, eng_gloss, notes').eq('lesson_id', lessonData.id),
          client.from('dialogues').select('id, title').eq('lesson_id', lessonData.id),
          client.from('grammar_tips').select('id, title, body_markdown').eq('lesson_id', lessonData.id),
          client.from('quizzes').select('id, title').eq('ref_id', lessonData.id).eq('published', true)
        ]);

        if (!vocabRes.error && vocabRes.data) {
          setVocab(vocabRes.data);
          const vIds = vocabRes.data.map((v: any) => v.id);
          if (vIds.length) {
            const { data: variants } = await client
              .from('vocab_variants')
              .select('vocab_id, dialect, phrase, ipa, audio_url')
              .in('vocab_id', vIds);
            const by: Record<string, any[]> = {};
            (variants || []).forEach((vv: any) => {
              by[vv.vocab_id] = [...(by[vv.vocab_id] || []), vv];
            });
            setVariantsByVocab(by);
          }
        }

        if (!dialoguesRes.error && dialoguesRes.data) {
          setDialogues(dialoguesRes.data);
          const dIds = dialoguesRes.data.map((d: any) => d.id);
          if (dIds.length) {
            const { data: lines } = await client
              .from('dialogue_lines')
              .select('dialogue_id, order_index, speaker, dialect, line, ipa, audio_url')
              .in('dialogue_id', dIds)
              .order('order_index', { ascending: true });
            const by: Record<string, any[]> = {};
            (lines || []).forEach((ln: any) => {
              by[ln.dialogue_id] = [...(by[ln.dialogue_id] || []), ln];
            });
            setLinesByDialogue(by);
          }
        }

        if (!grammarRes.error && grammarRes.data) setGrammar(grammarRes.data);

        if (!quizzesRes.error && quizzesRes.data) {
          const qIds = quizzesRes.data.map((q: any) => q.id);
          if (qIds.length) {
            const { data: questions } = await client
              .from('questions')
              .select('id, quiz_id, type, prompt, explanation')
              .in('quiz_id', qIds);
            if (questions && questions.length) {
              const qsIds = questions.map((q: any) => q.id);
              const { data: answers } = await client
                .from('answers')
                .select('question_id, label, is_correct')
                .in('question_id', qsIds);
              // Merge for preview
              const answersByQ: Record<string, any[]> = {};
              (answers || []).forEach((a: any) => {
                answersByQ[a.question_id] = [...(answersByQ[a.question_id] || []), a];
              });
              const preview = questions.map((q: any) => ({ ...q, answers: answersByQ[q.id] || [] }));
              setQuiz(preview);
            }
          }
        }

        setLoading(false);
      } catch (e: any) {
        setError(e.message || 'Error loading lesson');
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) return <main className="container mx-auto py-10"><p className="text-sm text-muted-foreground">Loading...</p></main>;
  if (error || !lesson) return <main className="container mx-auto py-10"><p className="text-sm text-muted-foreground">Not found</p></main>;

  return (
    <main className="container mx-auto py-10">
      <Seo title={`Lesson – ${lesson.title}`} description={lesson.summary} canonical={`/lessons/${lesson.slug}`} />
      <BackButton fallbackPath="/learn" />
      
      <div className="w-full max-w-4xl mx-auto mb-6">
        <img
          src={lesson.cover_image_url || '/placeholder.svg'}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg' }}
          alt={`${lesson.title} cover image`}
          loading="lazy"
          className="w-full h-auto object-contain rounded-lg shadow-lg"
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Badge variant="secondary">{lesson.level}</Badge>
        <Link to={`/learn/${lesson.slug}/practice`}>
          <Button className="gap-2">
            <Play className="h-4 w-4" />
            Start Practice
          </Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
      <p className="text-muted-foreground mb-6">{lesson.summary}</p>

      <section className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>{lesson.body_markdown}</ReactMarkdown>
      </section>

      <section className="mt-8 grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Vocabulary</h3>
            {vocab.length === 0 ? (
              <p className="text-sm text-muted-foreground">No vocabulary yet.</p>
            ) : (
              <ul className="text-sm space-y-2">
                {vocab.map((v) => (
                  <li key={v.id}>
                    <span className="font-medium">{v.base_term}</span> – {v.eng_gloss}
                    <div className="text-muted-foreground">
                      {(variantsByVocab[v.id] || []).map((vv) => (
                        <span key={vv.dialect + vv.phrase} className="mr-2">[{vv.dialect}] {vv.phrase}</span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Dialogue</h3>
            {dialogues.length === 0 ? (
              <p className="text-sm text-muted-foreground">No dialogues yet.</p>
            ) : (
              <div className="space-y-4">
                {dialogues.map((d) => (
                  <div key={d.id}>
                    <h4 className="font-medium mb-1">{d.title}</h4>
                    <ul className="text-sm text-muted-foreground">
                      {(linesByDialogue[d.id] || []).map((ln) => (
                        <li key={ln.order_index}>
                          <span className="font-medium">{ln.speaker}:</span> [{ln.dialect}] {ln.line}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Grammar tips</h3>
            {grammar.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tips yet.</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {grammar.map((g) => (
                  <div key={g.id} className="mb-4">
                    <h4 className="font-medium">{g.title}</h4>
                    <ReactMarkdown>{g.body_markdown}</ReactMarkdown>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Preview quiz</h3>
            {quiz.length === 0 ? (
              <p className="text-sm text-muted-foreground">No quiz yet.</p>
            ) : (
              <ul className="text-sm space-y-3">
                {quiz.map((q: any) => (
                  <li key={q.id}>
                    <div className="font-medium">{q.prompt}</div>
                    <ul className="list-disc pl-5 text-muted-foreground">
                      {(q.answers || []).map((a: any, idx: number) => (
                        <li key={idx} className={a.is_correct ? 'text-primary' : ''}>{a.label}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default LessonDetail;
