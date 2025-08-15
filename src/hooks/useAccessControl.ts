import { useAuth } from '@/contexts/AuthContext';

export interface AccessLimits {
  maxLessons: number;
  maxVocabItems: number;
  maxQuizzes: number;
}

// Free tier limits
const FREE_LIMITS: AccessLimits = {
  maxLessons: 3,
  maxVocabItems: 5,
  maxQuizzes: 1,
};

export const useAccessControl = () => {
  const { user } = useAuth();
  
  const isPremium = !!user; // Logged in users get premium access
  
  const checkLessonAccess = (lessonIndex: number): boolean => {
    if (isPremium) return true;
    return lessonIndex < FREE_LIMITS.maxLessons;
  };
  
  const checkVocabAccess = (vocabIndex: number): boolean => {
    if (isPremium) return true;
    return vocabIndex < FREE_LIMITS.maxVocabItems;
  };
  
  const checkQuizAccess = (quizIndex: number): boolean => {
    if (isPremium) return true;
    return quizIndex < FREE_LIMITS.maxQuizzes;
  };
  
  const getAccessLimits = (): AccessLimits => {
    if (isPremium) {
      return {
        maxLessons: Infinity,
        maxVocabItems: Infinity,
        maxQuizzes: Infinity,
      };
    }
    return FREE_LIMITS;
  };
  
  return {
    isPremium,
    checkLessonAccess,
    checkVocabAccess,
    checkQuizAccess,
    getAccessLimits,
    freeLimits: FREE_LIMITS,
  };
};