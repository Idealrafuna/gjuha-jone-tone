import React from 'react';
import DressShqiponjaGame from '@/games/DressShqiponjaGame';
import { Seo } from '@/components/Seo';
import { AccessGate } from '@/components/AccessGate';

const DressShqiponjaPage = () => {
  const handleAwardXP = (amount: number, reason: string) => {
    console.log(`Awarded ${amount} XP for: ${reason}`);
    // You can integrate with your XP system here
  };

  return (
    <>
      <Seo 
        title="Dress the Shqiponja - Albanian Traditional Clothing Game | BeAlbanian"
        description="Dress up your Shqiponja with traditional Albanian clothing! Learn about plis, qeleshe, fustanella, xhubleta, and more traditional garments from different regions."
      />
      <main className="min-h-screen">
        <DressShqiponjaGame onAwardXP={handleAwardXP} />
      </main>
    </>
  );
};

export default DressShqiponjaPage;