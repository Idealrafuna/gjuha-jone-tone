import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessControl } from '@/hooks/useAccessControl';
import { PremiumModal } from '@/components/PremiumModal';
import ValleDanceGame from '@/games/ValleDanceGame';
import { Seo } from '@/components/Seo';

const ValleDancePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useAccessControl();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [gameMode, setGameMode] = useState<"free" | "premium">("free");

  // If user tries to access premium mode without being premium
  React.useEffect(() => {
    if (gameMode === "premium" && !isPremium) {
      setShowPremiumModal(true);
      setGameMode("free");
    }
  }, [gameMode, isPremium]);

  const handleClose = () => {
    navigate('/');
  };

  const handleAwardXP = (xp: number) => {
    // TODO: Integrate with your XP system
    console.log(`Awarded ${xp} XP!`);
  };

  return (
    <>
      <Seo
        title="Valle Dance Moves - Albanian Folk Dance Rhythm Game"
        description="Play Valle Dance Moves, an exciting rhythm game featuring Albanian folk music. Hit the arrow prompts in time with traditional Valle dance beats!"
      />
      
      <div className="h-screen w-full overflow-hidden">
        <ValleDanceGame
          mode={gameMode}
          userId={user?.id || null}
          onClose={handleClose}
          onAwardXP={handleAwardXP}
          durationMs={180000} // 3 minutes
        />
      </div>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="Premium Valle Dance Mode"
      />
    </>
  );
};

export default ValleDancePage;