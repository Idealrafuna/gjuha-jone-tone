import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessControl } from '@/hooks/useAccessControl';
import { PremiumModal } from '@/components/PremiumModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ShqipDashGame from '@/games/ShqipDashGame';
import { Seo } from '@/components/Seo';
import { Gamepad2, Zap, Crown, ArrowLeft } from 'lucide-react';

const ShqipDashPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useAccessControl();
  const [gameMode, setGameMode] = useState<'free' | 'premium'>(isPremium ? 'premium' : 'free');
  const [showGame, setShowGame] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleModeSelect = (mode: 'free' | 'premium') => {
    if (mode === 'premium' && !isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setGameMode(mode);
    setShowGame(true);
  };

  const handleAwardXP = (xp: number) => {
    // TODO: Integrate with your XP system
    console.log(`Awarded ${xp} XP`);
  };

  if (showGame) {
    return (
      <div className="min-h-screen">
        <Seo 
          title="Shqip Dash - Albanian Word Game"
          description="Play Shqip Dash, an exciting word recognition game to test your Albanian vocabulary skills."
        />
        <ShqipDashGame
          mode={gameMode}
          userId={user?.id || null}
          onClose={() => setShowGame(false)}
          onAwardXP={handleAwardXP}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Seo 
        title="Games - BeAlbanian"
        description="Play interactive Albanian language games to improve your vocabulary and have fun while learning."
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/learn')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Learn
          </Button>
          
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Gamepad2 className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">Games</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Test your Albanian vocabulary skills with fun, interactive games
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Gamepad2 className="w-6 h-6" />
                    Shqip Dash
                  </CardTitle>
                  <CardDescription className="text-red-100">
                    Fast-paced word recognition game - tap only the Albanian words!
                  </CardDescription>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-4xl font-bold">🇦🇱</div>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    Word Game
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Free Mode */}
                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-500" />
                      Free Mode
                    </CardTitle>
                    <CardDescription>
                      Perfect for beginners - slower pace, easier gameplay
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Difficulty:</span>
                        <Badge variant="secondary">Easy</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Speed:</span>
                        <span className="text-muted-foreground">Moderate</span>
                      </div>
                      <div className="flex justify-between">
                        <span>XP Reward:</span>
                        <span className="text-green-600 font-medium">10 XP per hit</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleModeSelect('free')}
                      className="w-full"
                      variant="outline"
                    >
                      Play Free Mode
                    </Button>
                  </CardContent>
                </Card>

                {/* Premium Mode */}
                <Card className="border-2 hover:border-primary/50 transition-colors relative">
                  {!isPremium && (
                    <div className="absolute top-2 right-2">
                      <Crown className="w-5 h-5 text-yellow-500" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      Premium Mode
                      {!isPremium && <Badge variant="outline">Premium</Badge>}
                    </CardTitle>
                    <CardDescription>
                      Challenge yourself - faster pace, higher rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Difficulty:</span>
                        <Badge variant="destructive">Hard</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Speed:</span>
                        <span className="text-red-600 font-medium">Fast</span>
                      </div>
                      <div className="flex justify-between">
                        <span>XP Reward:</span>
                        <span className="text-green-600 font-medium">12+ XP per hit</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleModeSelect('premium')}
                      className="w-full"
                      variant={isPremium ? "default" : "hero"}
                    >
                      {isPremium ? "Play Premium Mode" : "Unlock Premium"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">How to Play</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Words will fall from the top of the screen</li>
                  <li>• Tap only the Albanian words (marked with •)</li>
                  <li>• Avoid tapping English words or you'll lose lives</li>
                  <li>• Build combos for bonus points and XP</li>
                  <li>• Survive for 60 seconds to complete the game</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="Premium Game Mode"
      />
    </div>
  );
};

export default ShqipDashPage;