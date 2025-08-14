import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BackButton } from "@/components/BackButton";

import { getRandomTip } from "@/data/culturalTips";
import { Flame, Trophy, Heart, Zap } from "lucide-react";
import { QuestionEngine, Question, PracticeItem, getSpacedRepetitionInterval, updateEase, VocabItem, QuizItem } from "@/components/practice/QuestionEngine";
import { QuestionView } from "@/components/practice/QuestionView";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Dialect } from "@/pages/LessonsPage";

interface SessionStats {
  accuracy: number;
  xpEarned: number;
  questionsAnswered: number;
  correctAnswers: number;
}

export default function PracticePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dialect: Dialect = (localStorage.getItem("dialect") as Dialect) || "tosk";
  
  // Data loading
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  
  // Practice session
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    accuracy: 0,
    xpEarned: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
  });
  
  // Gamification
  const [xpTotal, setXpTotal] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [heartsEnabled] = useState(false); // Default disabled
  
  
  // Modals
  const [showEndModal, setShowEndModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);

  // Load lesson data
  useEffect(() => {
    const loadLessonData = async () => {
      if (!slug) return;
      
      try {
        // Load lesson
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('id, slug, title, level, summary, published')
          .eq('slug', slug)
          .single();
          
        if (lessonError || !lessonData || !lessonData.published) {
          setError('Lesson not found');
          return;
        }
        
        setLesson(lessonData);
        
        // Load vocab with variants
        const { data: vocabData, error: vocabError } = await supabase
          .from('vocab')
          .select(`
            id, base_term, eng_gloss, notes,
            vocab_variants ( dialect, phrase, ipa, audio_url )
          `)
          .eq('lesson_id', lessonData.id);
          
        if (!vocabError && vocabData) {
          const formattedVocab: VocabItem[] = vocabData.map(v => ({
            id: v.id,
            base_term: v.base_term,
            eng_gloss: v.eng_gloss,
            variants: (v.vocab_variants as any[]).map(vv => ({
              dialect: vv.dialect as Dialect,
              phrase: vv.phrase,
              ipa: vv.ipa,
              audio_url: vv.audio_url,
            })),
          }));
          setVocab(formattedVocab);
        }
        
        // Load quizzes
        const { data: quizzesData, error: quizzesError } = await supabase
          .from('quizzes')
          .select('id, title, slug, published')
          .eq('ref_id', lessonData.id)
          .eq('published', true);
          
        if (!quizzesError && quizzesData) {
          const quizIds = quizzesData.map(q => q.id);
          
          if (quizIds.length > 0) {
            const { data: questionsData } = await supabase
              .from('questions')
              .select(`
                id, quiz_id, type, prompt, explanation,
                answers ( label, is_correct )
              `)
              .in('quiz_id', quizIds);
              
            if (questionsData) {
              const formattedQuizzes: QuizItem[] = questionsData.map(q => ({
                id: q.id,
                type: q.type as 'multiple_choice' | 'true_false',
                prompt: q.prompt,
                explanation: q.explanation || undefined,
                answers: (q.answers as any[]).map(a => ({
                  label: a.label,
                  is_correct: a.is_correct,
                })),
              }));
              setQuizzes(formattedQuizzes);
            }
          }
        }
        
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load lesson');
        setLoading(false);
      }
    };
    
    loadLessonData();
  }, [slug]);

  // Initialize gamification data
  useEffect(() => {
    const storedXP = parseInt(localStorage.getItem('totalXP') || '0');
    const storedStreak = parseInt(localStorage.getItem('streakCount') || '0');
    const lastPractice = localStorage.getItem('lastPracticeDate');
    
    setXpTotal(storedXP);
    
    // Check if streak is still valid (practiced today or yesterday)
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastPractice === today || lastPractice === yesterday) {
      setStreakCount(storedStreak);
    } else {
      setStreakCount(0);
      localStorage.setItem('streakCount', '0');
    }
  }, []);

  // Generate practice questions
  useEffect(() => {
    if (vocab.length === 0 && quizzes.length === 0) return;
    
    const engine = new QuestionEngine(vocab, quizzes, dialect);
    const practiceQuestions = engine.generateQuestions(15);
    setQuestions(practiceQuestions);
  }, [vocab, quizzes, dialect]);

  const handleAnswer = (userAnswer: string, correct: boolean) => {
    setIsCorrect(correct);
    setShowResult(true);
    
    // Check for cultural tip (every 3-5 questions)
    if (sessionStats.questionsAnswered > 0 && sessionStats.questionsAnswered % 4 === 0) {
      toast({
        title: "Cultural Tip",
        description: getRandomTip(),
      });
    }
    
    // Update session stats
    const newStats = {
      ...sessionStats,
      questionsAnswered: sessionStats.questionsAnswered + 1,
      correctAnswers: sessionStats.correctAnswers + (correct ? 1 : 0),
    };
    
    // Calculate XP
    let xpGained = 0;
    if (correct) {
      xpGained = 10; // First try correct
      if (questions[currentIndex].type === 'type_word') {
        xpGained += 2; // Typing bonus
      }
    } else {
      if (userAnswer !== "") xpGained = 5; // Attempted but wrong
    }
    
    newStats.xpEarned += xpGained;
    newStats.accuracy = Math.round((newStats.correctAnswers / newStats.questionsAnswered) * 100);
    
    setSessionStats(newStats);
    
    // Update XP and show toast
    if (xpGained > 0) {
      const newXP = xpTotal + xpGained;
      setXpTotal(newXP);
      localStorage.setItem('totalXP', newXP.toString());
      
      toast({
        title: `+${xpGained} XP`,
        description: correct ? "Great job!" : "Keep trying!",
      });
    }
    
    // Handle hearts
    if (heartsEnabled && !correct && userAnswer !== "") {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      
      if (newHearts === 0) {
        setShowGameOverModal(true);
        return;
      }
    }
    
    // Update spaced repetition data
    updatePracticeItem(questions[currentIndex], correct);
  };

  const handleNext = () => {
    setShowResult(false);
    
    if (currentIndex >= questions.length - 1) {
      // Session complete
      updateStreak();
      setShowEndModal(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const updatePracticeItem = (question: Question, correct: boolean) => {
    if (!lesson) return;
    
    const storageKey = `practice:${lesson.id}`;
    const stored = localStorage.getItem(storageKey);
    const practiceData: Record<string, PracticeItem> = stored ? JSON.parse(stored) : {};
    
    const item = practiceData[question.id] || {
      id: question.id,
      ease: 2,
      nextDue: Date.now(),
      correctCount: 0,
      wrongCount: 0,
    };
    
    item.ease = updateEase(item.ease, correct);
    item.nextDue = Date.now() + (correct ? getSpacedRepetitionInterval(item.ease) : 60000);
    
    if (correct) {
      item.correctCount++;
    } else {
      item.wrongCount++;
    }
    
    practiceData[question.id] = item;
    localStorage.setItem(storageKey, JSON.stringify(practiceData));
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastPractice = localStorage.getItem('lastPracticeDate');
    
    if (lastPractice !== today && sessionStats.xpEarned > 0) {
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      localStorage.setItem('streakCount', newStreak.toString());
      localStorage.setItem('lastPracticeDate', today);
    }
  };

  const handleContinue = () => {
    navigate(`/lessons/${slug}`);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowResult(false);
    setSessionStats({ accuracy: 0, xpEarned: 0, questionsAnswered: 0, correctAnswers: 0 });
    setHearts(5);
    setShowEndModal(false);
    setShowGameOverModal(false);
  };

  if (loading) {
    return (
      <main className="container mx-auto max-w-3xl p-4">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Loading practice session...</p>
        </div>
      </main>
    );
  }

  if (error || !lesson) {
    return (
      <main className="container mx-auto max-w-3xl p-4">
        <BackButton fallbackPath="/learn" />
        <div className="text-center py-20">
          <p className="text-destructive">{error || "Lesson not found"}</p>
        </div>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="container mx-auto max-w-3xl p-4">
        <BackButton fallbackPath={`/lessons/${slug}`} />
        <div className="text-center py-20">
          <p className="text-muted-foreground">No practice questions available for this lesson.</p>
        </div>
      </main>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100;

  return (
    <main className="container mx-auto max-w-3xl p-4 space-y-4">
      <BackButton fallbackPath={`/lessons/${slug}`} />
      
      {/* Top bar with stats */}
      <Card className="rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3" />
                {xpTotal} XP
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Flame className="h-3 w-3" />
                {streakCount} day streak
              </Badge>
              {heartsEnabled && (
                <Badge variant="outline" className="gap-1">
                  <Heart className="h-3 w-3" />
                  {hearts}
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentIndex + 1} / {questions.length}
            </div>
          </div>
          <Progress value={progress} className="mt-3 h-2" />
        </CardContent>
      </Card>

      {/* Question */}
      <div className="w-full">
        <QuestionView
          question={currentQuestion}
          onAnswer={handleAnswer}
          showResult={showResult}
          isCorrect={isCorrect}
        />
      </div>

      {/* Next button */}
      {showResult && (
        <div className="flex justify-center">
          <Button onClick={handleNext} size="lg" className="min-w-32">
            {currentIndex >= questions.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      )}

      {/* End of session modal */}
      <Dialog open={showEndModal} onOpenChange={setShowEndModal}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Practice Complete!
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{sessionStats.accuracy}%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{sessionStats.xpEarned}</div>
                    <div className="text-xs text-muted-foreground">XP Earned</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{sessionStats.correctAnswers}</div>
                    <div className="text-xs text-muted-foreground">Correct</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleContinue} className="flex-1">
                    Continue Learning
                  </Button>
                  <Button onClick={handleRestart} variant="outline">
                    Practice Again
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Game over modal */}
      <Dialog open={showGameOverModal} onOpenChange={setShowGameOverModal}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Out of Hearts!</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 pt-4">
                <p>You've run out of hearts. Review your mistakes and try again!</p>
                <div className="flex gap-2">
                  <Button onClick={handleRestart} className="flex-1">
                    Try Again
                  </Button>
                  <Button onClick={handleContinue} variant="outline">
                    Back to Lesson
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
}