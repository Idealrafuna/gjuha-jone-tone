import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessControl } from '@/hooks/useAccessControl';
import { PremiumModal } from '@/components/PremiumModal';
import GjyshjasKitchenGame from '@/games/GjyshjasKitchenGame';
import { Seo } from '@/components/Seo';

const GjyshjasKitchenPage = () => {
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
    console.log(`Awarded ${xp} XP for cooking!`);
  };

  return (
    <>
      <Seo
        title="Gjyshja's Kitchen - Albanian Cooking Game for Kids"
        description="Learn to cook traditional Albanian dishes with Gjyshja! A fun cooking simulation game featuring byrek, tave kosi, and other Albanian recipes."
      />
      
      <div className="h-screen w-full overflow-hidden">
        <GjyshjasKitchenGame
          mode={gameMode}
          userId={user?.id || null}
          onClose={handleClose}
          onAwardXP={handleAwardXP}
        />
      </div>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="Premium Gjyshja's Kitchen Mode"
      />
    </>
  );
};

export default GjyshjasKitchenPage;