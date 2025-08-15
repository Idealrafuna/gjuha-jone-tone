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
import { Play, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";

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

type SectionType = 'dialogues' | 'vocab' | 'grammar' | 'quiz';

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
  
  // Navigation state
  const [activeSection, setActiveSection] = useState<SectionType>('dialogues');
  const [quizExpanded, setQuizExpanded] = useState(false);
  const [quizPage, setQuizPage] = useState(0);
  
  const QUESTIONS_PER_PAGE = 5;

  useEffect(() => {
    const load = async () => {
      try {
        const client = supabase as any; // temp types bypass
        const { data: lessonData, error: lessonErr } = await client
          .from('lessons')
          .select('id, slug, title, level, summary, body_markdown, cover_image_url, published')
          .eq('slug', slug)
          .single();
        
        console.log("LESSONS:", lessonData, lessonErr);
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
        
        console.log("VOCAB:", vocabRes.data, vocabRes.error);
        console.log("DIALOGUES:", dialoguesRes.data, dialoguesRes.error);
        console.log("GRAMMAR_TIPS:", grammarRes.data, grammarRes.error);
        console.log("QUIZZES:", quizzesRes.data, quizzesRes.error);

        if (!vocabRes.error && vocabRes.data) {
          setVocab(vocabRes.data);
          const vIds = vocabRes.data.map((v: any) => v.id);
          if (vIds.length) {
            const { data: variants, error: variantsErr } = await client
              .from('vocab_variants')
              .select('vocab_id, dialect, phrase, ipa, audio_url')
              .in('vocab_id', vIds);
            
            console.log("VOCAB_VARIANTS:", variants, variantsErr);
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
            const { data: lines, error: linesErr } = await client
              .from('dialogue_lines')
              .select('dialogue_id, order_index, speaker, dialect, line, ipa, audio_url')
              .in('dialogue_id', dIds)
              .order('order_index', { ascending: true });
            
            console.log("DIALOGUE_LINES:", lines, linesErr);
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
            const { data: questions, error: questionsErr } = await client
              .from('questions')
              .select('id, quiz_id, type, prompt, explanation')
              .in('quiz_id', qIds);
            
            console.log("QUESTIONS:", questions, questionsErr);
            if (questions && questions.length) {
              const qsIds = questions.map((q: any) => q.id);
              const { data: answers, error: answersErr } = await client
                .from('answers')
                .select('question_id, label, is_correct')
                .in('question_id', qsIds);
              
              console.log("ANSWERS:", answers, answersErr);
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

  const totalQuizPages = Math.ceil(quiz.length / QUESTIONS_PER_PAGE);
  const paginatedQuiz = quiz.slice(quizPage * QUESTIONS_PER_PAGE, (quizPage + 1) * QUESTIONS_PER_PAGE);

  const sections = [
    { id: 'dialogues', label: 'Dialogues', count: dialogues.length },
    { id: 'vocab', label: 'Vocab', count: vocab.length },
    { id: 'grammar', label: 'Grammar', count: grammar.length },
    { id: 'quiz', label: 'Quiz', count: quiz.length },
  ] as const;

  const renderDialogues = () => (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4 text-lg">Dialogues</h3>
        {dialogues.length === 0 ? (
          <p className="text-sm text-muted-foreground">No dialogues yet.</p>
        ) : (
          <div className="space-y-6">
            {dialogues.map((d) => (
              <div key={d.id}>
                <h4 className="font-medium mb-3 text-base">{d.title}</h4>
                <div className="space-y-2">
                  {(linesByDialogue[d.id] || []).map((ln) => (
                    <div key={ln.order_index} className="text-sm">
                      <span className="font-medium text-primary">{ln.speaker}:</span>{' '}
                      <span className="text-muted-foreground">[{ln.dialect}]</span>{' '}
                      {ln.line}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderVocab = () => (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4 text-lg">Vocabulary</h3>
        {vocab.length === 0 ? (
          <p className="text-sm text-muted-foreground">No vocabulary yet.</p>
        ) : (
          <div className="space-y-4">
            {vocab.map((v) => (
              <div key={v.id} className="border-b border-border/50 pb-3 last:border-b-0">
                <div className="font-medium text-base mb-1">{v.base_term}</div>
                <div className="text-sm text-muted-foreground mb-2">{v.eng_gloss}</div>
                {v.notes && <div className="text-sm text-muted-foreground italic mb-2">{v.notes}</div>}
                <div className="flex flex-wrap gap-2">
                  {(variantsByVocab[v.id] || []).map((vv) => (
                    <span key={vv.dialect + vv.phrase} className="text-xs bg-muted px-2 py-1 rounded">
                      [{vv.dialect}] {vv.phrase}
                      {vv.ipa && <span className="text-muted-foreground ml-1">/{vv.ipa}/</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderGrammar = () => (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4 text-lg">Grammar Tips</h3>
        {grammar.length === 0 ? (
          <p className="text-sm text-muted-foreground">No grammar tips yet.</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
            {grammar.map((g) => (
              <div key={g.id}>
                <h4 className="font-medium text-base mb-2">{g.title}</h4>
                <ReactMarkdown>{g.body_markdown}</ReactMarkdown>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderQuiz = () => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Quiz</h3>
          {quiz.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuizExpanded(!quizExpanded)}
              className="gap-2"
            >
              {quizExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Start Quiz
                </>
              )}
            </Button>
          )}
        </div>

        {quiz.length === 0 ? (
          <p className="text-sm text-muted-foreground">No quiz yet.</p>
        ) : !quizExpanded ? (
          <p className="text-sm text-muted-foreground">
            {quiz.length} question{quiz.length !== 1 ? 's' : ''} available. Click "Start Quiz" to begin.
          </p>
        ) : (
          <div className="space-y-4">
            {totalQuizPages > 1 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>Page {quizPage + 1} of {totalQuizPages} ({quiz.length} total questions)</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuizPage(Math.max(0, quizPage - 1))}
                    disabled={quizPage === 0}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    Back
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuizPage(Math.min(totalQuizPages - 1, quizPage + 1))}
                    disabled={quizPage === totalQuizPages - 1}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {paginatedQuiz.map((q: any, idx: number) => (
                <div key={q.id} className="border border-border rounded-lg p-4">
                  <div className="font-medium mb-3">
                    {quizPage * QUESTIONS_PER_PAGE + idx + 1}. {q.prompt}
                  </div>
                  <div className="space-y-2">
                    {(q.answers || []).map((a: any, answerIdx: number) => (
                      <div key={answerIdx} className={`text-sm p-2 rounded ${a.is_correct ? 'bg-primary/10 text-primary' : 'bg-muted/50'}`}>
                        {String.fromCharCode(65 + answerIdx)}. {a.label}
                        {a.is_correct && <span className="ml-2 text-xs">(Correct)</span>}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="mt-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

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

      <section className="prose prose-sm dark:prose-invert max-w-none mb-8">
        <ReactMarkdown>{lesson.body_markdown}</ReactMarkdown>
      </section>

      {/* Section Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection(section.id as SectionType)}
              className="gap-2"
            >
              {section.label}
              {section.count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {section.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <div className="space-y-6">
        {activeSection === 'dialogues' && renderDialogues()}
        {activeSection === 'vocab' && renderVocab()}
        {activeSection === 'grammar' && renderGrammar()}
        {activeSection === 'quiz' && renderQuiz()}
      </div>
    </main>
  );
};

export default LessonDetail;
