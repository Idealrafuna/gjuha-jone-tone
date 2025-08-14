import { Dialect } from "@/pages/LessonsPage";

export interface VocabItem {
  id: string;
  base_term: string;
  eng_gloss: string;
  variants: Array<{
    dialect: Dialect;
    phrase: string;
    ipa?: string | null;
    audio_url?: string | null;
  }>;
}

export interface QuizItem {
  id: string;
  type: 'multiple_choice' | 'true_false';
  prompt: string;
  explanation?: string;
  answers: Array<{
    label: string;
    is_correct: boolean;
  }>;
}

export type QuestionType = 'mcq_en_sq' | 'mcq_sq_en' | 'type_word' | 'match_pairs' | 'audio';

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  correctAnswer: string;
  options?: string[];
  pairs?: Array<{ left: string; right: string }>;
  explanation?: string;
  audioUrl?: string;
}

export interface PracticeItem {
  id: string;
  ease: number; // 0-5
  nextDue: number; // timestamp
  correctCount: number;
  wrongCount: number;
}

export class QuestionEngine {
  private vocab: VocabItem[];
  private quizzes: QuizItem[];
  private dialect: Dialect;

  constructor(vocab: VocabItem[], quizzes: QuizItem[], dialect: Dialect) {
    this.vocab = vocab;
    this.quizzes = quizzes;
    this.dialect = dialect;
  }

  generateQuestions(count: number = 20): Question[] {
    const questions: Question[] = [];
    const usedItems = new Set<string>();

    // Generate vocab-based questions
    for (const item of this.vocab) {
      if (questions.length >= count) break;
      if (usedItems.has(item.id)) continue;

      const variant = this.pickVariant(item);
      if (!variant.phrase) continue;

      // Generate different question types for each vocab item
      const types: QuestionType[] = ['mcq_en_sq', 'mcq_sq_en', 'type_word'];
      if (variant.audio_url) types.push('audio');

      for (const type of types) {
        if (questions.length >= count) break;
        
        const question = this.createVocabQuestion(item, type, variant);
        if (question) {
          questions.push(question);
          usedItems.add(item.id);
        }
      }
    }

    // Generate quiz-based questions
    for (const quiz of this.quizzes) {
      if (questions.length >= count) break;
      if (usedItems.has(quiz.id)) continue;

      const question = this.createQuizQuestion(quiz);
      if (question) {
        questions.push(question);
        usedItems.add(quiz.id);
      }
    }

    // Add match pairs questions
    if (questions.length < count && this.vocab.length >= 4) {
      const matchQuestion = this.createMatchPairsQuestion();
      if (matchQuestion) questions.push(matchQuestion);
    }

    return this.shuffleArray(questions).slice(0, count);
  }

  private pickVariant(item: VocabItem) {
    const exact = item.variants.find(v => v.dialect === this.dialect);
    const backup = item.variants[0];
    return {
      phrase: exact?.phrase ?? backup?.phrase ?? item.base_term,
      ipa: exact?.ipa ?? backup?.ipa ?? null,
      audio_url: exact?.audio_url ?? backup?.audio_url ?? null,
    };
  }

  private createVocabQuestion(item: VocabItem, type: QuestionType, variant: any): Question | null {
    switch (type) {
      case 'mcq_en_sq':
        return {
          id: `${item.id}_en_sq`,
          type,
          prompt: `What is "${item.eng_gloss}" in Albanian?`,
          correctAnswer: variant.phrase,
          options: this.generateOptions(variant.phrase, 'sq'),
          explanation: variant.ipa ? `Pronunciation: /${variant.ipa}/` : undefined,
        };

      case 'mcq_sq_en':
        return {
          id: `${item.id}_sq_en`,
          type,
          prompt: `What does "${variant.phrase}" mean in English?`,
          correctAnswer: item.eng_gloss,
          options: this.generateOptions(item.eng_gloss, 'en'),
        };

      case 'type_word':
        return {
          id: `${item.id}_type`,
          type,
          prompt: `Type the Albanian word for "${item.eng_gloss}"`,
          correctAnswer: variant.phrase,
          explanation: variant.ipa ? `Pronunciation: /${variant.ipa}/` : undefined,
        };

      case 'audio':
        return {
          id: `${item.id}_audio`,
          type,
          prompt: 'Listen and select the correct meaning',
          correctAnswer: item.eng_gloss,
          options: this.generateOptions(item.eng_gloss, 'en'),
          audioUrl: variant.audio_url,
        };

      default:
        return null;
    }
  }

  private createQuizQuestion(quiz: QuizItem): Question | null {
    const correctAnswers = quiz.answers.filter(a => a.is_correct);
    if (correctAnswers.length === 0) return null;

    return {
      id: `quiz_${quiz.id}`,
      type: 'mcq_en_sq',
      prompt: quiz.prompt,
      correctAnswer: correctAnswers[0].label,
      options: quiz.answers.map(a => a.label),
      explanation: quiz.explanation,
    };
  }

  private createMatchPairsQuestion(): Question | null {
    const pairs = this.vocab.slice(0, 6).map(item => {
      const variant = this.pickVariant(item);
      return {
        left: item.eng_gloss,
        right: variant.phrase,
      };
    });

    if (pairs.length < 4) return null;

    return {
      id: 'match_pairs',
      type: 'match_pairs',
      prompt: 'Match the English words with their Albanian translations',
      correctAnswer: '', // Not used for match pairs
      pairs,
    };
  }

  private generateOptions(correct: string, language: 'en' | 'sq'): string[] {
    const options = [correct];
    const pool = language === 'en' 
      ? this.vocab.map(v => v.eng_gloss)
      : this.vocab.map(v => this.pickVariant(v).phrase).filter(Boolean);

    const filtered = pool.filter(option => option !== correct);
    
    while (options.length < 4 && filtered.length > 0) {
      const randomIndex = Math.floor(Math.random() * filtered.length);
      const option = filtered.splice(randomIndex, 1)[0];
      options.push(option);
    }

    return this.shuffleArray(options);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export function getSpacedRepetitionInterval(ease: number): number {
  const intervals = [60000, 600000, 86400000, 259200000, 604800000]; // 1m, 10m, 1d, 3d, 7d
  return intervals[Math.min(ease, intervals.length - 1)] || intervals[intervals.length - 1];
}

export function updateEase(ease: number, correct: boolean): number {
  if (correct) {
    return Math.min(5, ease + 1);
  } else {
    return Math.max(0, ease - 1);
  }
}