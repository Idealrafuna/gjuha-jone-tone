import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessControl } from '@/hooks/useAccessControl';
import { PremiumModal } from '@/components/PremiumModal';
import MapQuestGame from '@/games/MapQuestGame';
import { Seo } from '@/components/Seo';

const MapQuestPage = () => {
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
        title="Map Quest: Albanian Cities - Geography Learning Game"
        description="Test your knowledge of Albanian and Kosovar geography! Drag city names to their correct locations on the map in this educational game."
      />
      
      <div className="h-screen w-full overflow-hidden">
        <MapQuestGame
          mode={gameMode}
          userId={user?.id || null}
          onClose={handleClose}
          onAwardXP={handleAwardXP}
          durationMs={300000} // 5 minutes
        />
      </div>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="Premium Map Quest Mode"
      />
    </>
  );
};

export default MapQuestPage;