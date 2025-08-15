import React, { useState } from 'react';
import { useAccessControl } from '@/hooks/useAccessControl';
import { PremiumModal } from './PremiumModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface AccessGateProps {
  children: React.ReactNode;
  type: 'lesson' | 'vocab' | 'quiz';
  index: number;
  itemName?: string;
  className?: string;
}

export const AccessGate: React.FC<AccessGateProps> = ({ 
  children, 
  type, 
  index, 
  itemName = '',
  className = ''
}) => {
  const [showModal, setShowModal] = useState(false);
  const { isPremium, checkLessonAccess, checkVocabAccess, checkQuizAccess } = useAccessControl();

  const hasAccess = React.useMemo(() => {
    switch (type) {
      case 'lesson':
        return checkLessonAccess(index);
      case 'vocab':
        return checkVocabAccess(index);
      case 'quiz':
        return checkQuizAccess(index);
      default:
        return true;
    }
  }, [type, index, checkLessonAccess, checkVocabAccess, checkQuizAccess]);

  if (hasAccess) {
    return <>{children}</>;
  }

  const getFeatureName = () => {
    const baseName = itemName || `${type} ${index + 1}`;
    return baseName;
  };

  return (
    <>
      <Card className={`relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-muted/80 to-muted backdrop-blur-sm z-10" />
        <div className="relative z-20 p-6 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Premium Feature</h3>
            <p className="text-sm text-muted-foreground">
              Unlock {getFeatureName()} and more with a free account
            </p>
          </div>
          <Button onClick={() => setShowModal(true)} className="mt-4">
            Get Free Access
          </Button>
        </div>
        <CardContent className="relative opacity-30 pointer-events-none">
          {children}
        </CardContent>
      </Card>
      
      <PremiumModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        feature={getFeatureName()}
      />
    </>
  );
};