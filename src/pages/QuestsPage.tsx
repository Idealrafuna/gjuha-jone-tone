import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Lock, Zap, Calendar, Trophy, Star } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { QUESTS, QUEST_CATEGORIES, Quest } from "@/data/quests";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessControl } from "@/hooks/useAccessControl";
import { PremiumModal } from "@/components/PremiumModal";
import { Seo } from "@/components/Seo";
import { BackButton } from "@/components/BackButton";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface CompletedQuest {
  questId: string;
  completedAt: string;
  weekKey: string;
}

export default function QuestsPage() {
  const { user } = useAuth();
  const { isPremium } = useAccessControl();
  const [completedQuests, setCompletedQuests] = useState<CompletedQuest[]>([]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [completedQuest, setCompletedQuest] = useState<Quest | null>(null);

  // Get current week key for weekly reset
  const getCurrentWeekKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const week = Math.ceil(((now.getTime() - new Date(year, 0, 1).getTime()) / (1000 * 60 * 60 * 24) + new Date(year, 0, 1).getDay() + 1) / 7);
    return `${year}-W${week}`;
  };

  // Get next Sunday for reset indicator
  const getNextSunday = () => {
    const now = new Date();
    const daysUntilSunday = 7 - now.getDay();
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    return nextSunday.toLocaleDateString();
  };

  // Load completed quests from localStorage
  useEffect(() => {
    if (!user) return;
    
    const stored = localStorage.getItem(`quests-completed-${user.id}`);
    if (stored) {
      try {
        setCompletedQuests(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading completed quests:', error);
      }
    }
  }, [user]);

  // Save completed quests to localStorage
  const saveCompletedQuests = (quests: CompletedQuest[]) => {
    if (!user) return;
    localStorage.setItem(`quests-completed-${user.id}`, JSON.stringify(quests));
    setCompletedQuests(quests);
  };

  // Check if quest is completed
  const isQuestCompleted = (questId: string) => {
    return completedQuests.some(cq => cq.questId === questId);
  };

  // Get completed quests for current week
  const getThisWeeksCompleted = () => {
    const currentWeek = getCurrentWeekKey();
    return completedQuests.filter(cq => cq.weekKey === currentWeek);
  };

  // Handle quest completion
  const completeQuest = (quest: Quest) => {
    if (!user) {
      toast.error('Please sign in to complete quests');
      return;
    }

    if (isQuestCompleted(quest.id)) {
      toast.info('Quest already completed this week!');
      return;
    }

    // Check premium requirements
    if (quest.premium && !isPremium) {
      setShowPremiumModal(true);
      return;
    }

    // Check free user limits (1 quest per week)
    const thisWeeksCompleted = getThisWeeksCompleted();
    if (!isPremium && thisWeeksCompleted.length >= 1) {
      setShowPremiumModal(true);
      return;
    }

    // Complete the quest
    const newCompletion: CompletedQuest = {
      questId: quest.id,
      completedAt: new Date().toISOString(),
      weekKey: getCurrentWeekKey()
    };

    const updatedCompleted = [...completedQuests, newCompletion];
    saveCompletedQuests(updatedCompleted);

    // Award XP
    if (typeof window !== 'undefined' && (window as any).onAwardXP) {
      (window as any).onAwardXP(quest.xp, `Quest: ${quest.title}`);
    }

    // Show badge modal
    setCompletedQuest(quest);
    setShowBadgeModal(true);

    toast.success(`Quest completed! Earned ${quest.xp} XP!`);
  };

  // Get dynamic icon component
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? IconComponent : LucideIcons.Star;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <CardContent>
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground">
              Please sign in to access quests and track your progress.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const thisWeeksCompleted = getThisWeeksCompleted();
  const availableQuests = isPremium ? QUESTS : QUESTS.filter(q => !q.premium);

  return (
    <>
      <Seo 
        title="Heritage Quests"
        description="Complete weekly challenges to connect with Albanian heritage and earn XP rewards."
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <BackButton fallbackPath="/" />
              <div>
                <h1 className="text-3xl font-bold">Heritage Quests</h1>
                <p className="text-muted-foreground">Complete weekly challenges to connect with Albanian heritage</p>
              </div>
            </div>

            {/* Weekly Reset Indicator */}
            <Alert className="mb-6">
              <Calendar className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  <strong>Weekly Reset:</strong> Next Sunday ({getNextSunday()})
                </span>
                <span className="text-sm">
                  Completed this week: {thisWeeksCompleted.length}/{isPremium ? QUESTS.length : '1'}
                </span>
              </AlertDescription>
            </Alert>

            {/* How it Works */}
            <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">How Heritage Quests Work:</h3>
                <p className="text-sm text-muted-foreground">
                  Complete offline and online challenges to learn about Albanian culture, practice the language, 
                  and connect with your family heritage. Each quest awards XP and unlocks special badges!
                  {!isPremium && " Free users can complete 1 quest per week, premium users have unlimited access."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {QUESTS.map((quest) => {
                const Icon = getIcon(quest.icon);
                const isCompleted = isQuestCompleted(quest.id);
                const isLocked = quest.premium && !isPremium;
                const categoryInfo = QUEST_CATEGORIES[quest.category];

                return (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`h-full transition-all duration-200 ${
                      isCompleted ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' :
                      isLocked ? 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800' :
                      'hover:shadow-md'
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${
                              isCompleted ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                              isLocked ? 'bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-600' :
                              'bg-primary/10 text-primary'
                            }`}>
                              {isCompleted ? (
                                <Check className="w-5 h-5" />
                              ) : isLocked ? (
                                <Lock className="w-5 h-5" />
                              ) : (
                                <Icon className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <Badge variant="secondary" className={categoryInfo.color}>
                                {categoryInfo.label}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            {quest.xp}
                          </div>
                        </div>
                        <CardTitle className={`text-lg leading-tight ${
                          isLocked ? 'text-muted-foreground' : ''
                        }`}>
                          {quest.title}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent>
                        <p className={`text-sm mb-4 ${
                          isLocked ? 'text-muted-foreground' : ''
                        }`}>
                          {quest.description}
                        </p>

                        {isCompleted ? (
                          <Button disabled className="w-full bg-green-600 hover:bg-green-600">
                            <Check className="w-4 h-4 mr-2" />
                            Completed
                          </Button>
                        ) : isLocked ? (
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => setShowPremiumModal(true)}
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Unlock with Premium
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => completeQuest(quest)}
                            className="w-full"
                          >
                            Mark as Done
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Progress Summary */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {thisWeeksCompleted.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Quests Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-500">
                    {thisWeeksCompleted.reduce((sum, cq) => {
                      const quest = QUESTS.find(q => q.id === cq.questId);
                      return sum + (quest?.xp || 0);
                    }, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">XP Earned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    {Math.round((thisWeeksCompleted.length / availableQuests.length) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badge Completion Modal */}
        <Dialog open={showBadgeModal} onOpenChange={setShowBadgeModal}>
          <DialogContent className="text-center">
            <DialogHeader>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-4"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              <DialogTitle className="text-xl">Quest Completed!</DialogTitle>
              <DialogDescription className="space-y-2">
                <div className="text-lg font-semibold text-primary">
                  {completedQuest?.title}
                </div>
                <div className="flex items-center justify-center gap-1 text-yellow-600">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium">+{completedQuest?.xp} XP Earned!</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Great job connecting with Albanian heritage! Keep exploring to unlock more quests.
                </p>
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => setShowBadgeModal(false)} className="mt-4">
              Continue
            </Button>
          </DialogContent>
        </Dialog>

        {/* Premium Modal */}
        <PremiumModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          feature="unlimited heritage quests"
        />
      </div>
    </>
  );
}