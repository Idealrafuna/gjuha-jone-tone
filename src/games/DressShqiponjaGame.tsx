import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccessControl } from '@/hooks/useAccessControl';
import { Save, Crown, Shirt, HardHat, Footprints } from 'lucide-react';
import { toast } from 'sonner';

interface ClothingItem {
  id: string;
  name: string;
  category: 'hat' | 'top' | 'bottom' | 'shoes' | 'accessory';
  region?: string;
  premium: boolean;
  color: string;
  description: string;
}

interface Outfit {
  hat?: ClothingItem;
  top?: ClothingItem;
  bottom?: ClothingItem;
  shoes?: ClothingItem;
  accessory?: ClothingItem;
}

const CLOTHING_ITEMS: ClothingItem[] = [
  // Free items
  { id: 'plis', name: 'Plis', category: 'hat', premium: false, color: 'bg-gray-100', description: 'Traditional white cap' },
  { id: 'qeleshe', name: 'Qeleshe', category: 'hat', premium: false, color: 'bg-red-500', description: 'Red felt cap' },
  { id: 'jelek', name: 'Jelek', category: 'top', premium: false, color: 'bg-blue-600', description: 'Traditional vest' },
  { id: 'xhubleta', name: 'Xhubleta', category: 'bottom', premium: false, color: 'bg-black', description: 'Traditional women\'s skirt' },
  { id: 'opinga', name: 'Opinga', category: 'shoes', premium: false, color: 'bg-amber-700', description: 'Traditional leather shoes' },
  
  // Premium items
  { id: 'fustanella', name: 'Fustanella', category: 'bottom', region: 'South', premium: true, color: 'bg-white', description: 'Men\'s traditional kilt' },
  { id: 'tropoja-hat', name: 'Tropoja Plis', category: 'hat', region: 'Tropoja', premium: true, color: 'bg-emerald-600', description: 'Northern mountain cap' },
  { id: 'vlora-vest', name: 'Vlora Jelek', category: 'top', region: 'Vlora', premium: true, color: 'bg-purple-600', description: 'Coastal ceremonial vest' },
  { id: 'cameria-dress', name: 'Çamëria Dress', category: 'bottom', region: 'Çamëria', premium: true, color: 'bg-rose-500', description: 'Traditional Çam dress' },
  { id: 'kosovo-scarf', name: 'Kosovo Shami', category: 'accessory', region: 'Kosovo', premium: true, color: 'bg-yellow-500', description: 'Traditional headscarf' },
  { id: 'gold-opinga', name: 'Golden Opinga', category: 'shoes', region: 'Ceremonial', premium: true, color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', description: 'Ceremonial golden shoes' },
];

interface DressShqiponjaGameProps {
  onAwardXP?: (amount: number, reason: string) => void;
}

const DressShqiponjaGame: React.FC<DressShqiponjaGameProps> = ({ onAwardXP }) => {
  const { isPremium } = useAccessControl();
  const [outfit, setOutfit] = useState<Outfit>({});
  const [selectedAvatar, setSelectedAvatar] = useState<'boy' | 'girl'>('girl');
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);

  const applyClothing = useCallback((item: ClothingItem) => {
    if (item.premium && !isPremium) {
      toast.error('Unlock premium to access this item!');
      return;
    }

    setOutfit(prev => {
      const newOutfit = { ...prev, [item.category]: item };
      
      // Check if outfit is complete
      const isComplete = newOutfit.hat && newOutfit.top && newOutfit.bottom && newOutfit.shoes;
      if (isComplete && onAwardXP) {
        onAwardXP(50, 'Completed outfit');
        toast.success('Outfit completed! +50 XP');
      }
      
      return newOutfit;
    });
  }, [isPremium, onAwardXP]);

  const removeClothing = useCallback((category: keyof Outfit) => {
    setOutfit(prev => {
      const newOutfit = { ...prev };
      delete newOutfit[category];
      return newOutfit;
    });
  }, []);

  const saveOutfit = useCallback(() => {
    if (Object.keys(outfit).length === 0) {
      toast.error('No outfit to save!');
      return;
    }
    
    setSavedOutfits(prev => [...prev, outfit]);
    localStorage.setItem('shqiponja-outfits', JSON.stringify([...savedOutfits, outfit]));
    toast.success('Outfit saved!');
    
    if (onAwardXP) {
      onAwardXP(25, 'Saved outfit');
    }
  }, [outfit, savedOutfits, onAwardXP]);

  const clearOutfit = useCallback(() => {
    setOutfit({});
  }, []);

  const availableItems = isPremium ? CLOTHING_ITEMS : CLOTHING_ITEMS.filter(item => !item.premium);

  const getCategoryItems = (category: string) => availableItems.filter(item => item.category === category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* How to Play */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-lg">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            Tap or drag clothes to dress your Shqiponja. Unlock more outfits by earning XP!
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Avatar Section */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  👗 Dress the Shqiponja
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={selectedAvatar === 'girl' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedAvatar('girl')}
                  >
                    👧 Girl
                  </Button>
                  <Button
                    variant={selectedAvatar === 'boy' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedAvatar('boy')}
                  >
                    👦 Boy
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Avatar Base */}
                <motion.div 
                  className="w-64 h-80 mx-auto bg-gradient-to-b from-peach-200 to-peach-300 rounded-2xl relative overflow-hidden"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Face */}
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-peach-300 rounded-full">
                    <div className="absolute top-4 left-3 w-2 h-2 bg-black rounded-full"></div>
                    <div className="absolute top-4 right-3 w-2 h-2 bg-black rounded-full"></div>
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-pink-400 rounded-full"></div>
                  </div>

                  {/* Clothing Slots */}
                  {/* Hat */}
                  <motion.div 
                    className="absolute top-2 left-1/2 transform -translate-x-1/2 w-20 h-8"
                    onClick={() => outfit.hat && removeClothing('hat')}
                  >
                    {outfit.hat && (
                      <motion.div
                        initial={{ scale: 0, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        className={`w-full h-full rounded-t-full ${outfit.hat.color} border-2 border-gray-300 cursor-pointer flex items-center justify-center text-xs font-bold`}
                      >
                        {outfit.hat.name}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Top */}
                  <motion.div 
                    className="absolute top-20 left-1/2 transform -translate-x-1/2 w-24 h-20"
                    onClick={() => outfit.top && removeClothing('top')}
                  >
                    {outfit.top && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-full h-full ${outfit.top.color} border-2 border-gray-300 cursor-pointer flex items-center justify-center text-xs font-bold text-white rounded-lg`}
                      >
                        {outfit.top.name}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Bottom */}
                  <motion.div 
                    className="absolute top-36 left-1/2 transform -translate-x-1/2 w-28 h-24"
                    onClick={() => outfit.bottom && removeClothing('bottom')}
                  >
                    {outfit.bottom && (
                      <motion.div
                        initial={{ scale: 0, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className={`w-full h-full ${outfit.bottom.color} border-2 border-gray-300 cursor-pointer flex items-center justify-center text-xs font-bold text-white rounded-b-full`}
                      >
                        {outfit.bottom.name}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Shoes */}
                  <motion.div 
                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-6"
                    onClick={() => outfit.shoes && removeClothing('shoes')}
                  >
                    {outfit.shoes && (
                      <motion.div
                        initial={{ scale: 0, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        className={`w-full h-full ${outfit.shoes.color} border-2 border-gray-300 cursor-pointer flex items-center justify-center text-xs font-bold rounded-full`}
                      >
                        {outfit.shoes.name}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Accessory */}
                  {outfit.accessory && (
                    <motion.div 
                      className="absolute top-6 right-2 w-8 h-8"
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      onClick={() => removeClothing('accessory')}
                    >
                      <div className={`w-full h-full ${outfit.accessory.color} border-2 border-gray-300 cursor-pointer rounded-full`}></div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 justify-center">
                  <Button onClick={saveOutfit} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Outfit
                  </Button>
                  <Button variant="outline" onClick={clearOutfit}>
                    Clear All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wardrobe Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👘 Wardrobe
                {!isPremium && (
                  <Badge variant="secondary" className="ml-2">
                    <Crown className="w-3 h-3 mr-1" />
                    Upgrade for more items
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="hat" className="w-full">
                <TabsList className="grid grid-cols-5 mb-4">
                  <TabsTrigger value="hat" className="flex items-center gap-1">
                    <HardHat className="w-4 h-4" />
                    <span className="hidden sm:inline">Hat</span>
                  </TabsTrigger>
                  <TabsTrigger value="top" className="flex items-center gap-1">
                    <Shirt className="w-4 h-4" />
                    <span className="hidden sm:inline">Top</span>
                  </TabsTrigger>
                  <TabsTrigger value="bottom">👗</TabsTrigger>
                  <TabsTrigger value="shoes" className="flex items-center gap-1">
                    <Footprints className="w-4 h-4" />
                    <span className="hidden sm:inline">Shoes</span>
                  </TabsTrigger>
                  <TabsTrigger value="accessory">✨</TabsTrigger>
                </TabsList>

                {['hat', 'top', 'bottom', 'shoes', 'accessory'].map((category) => (
                  <TabsContent key={category} value={category}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {getCategoryItems(category).map((item) => (
                        <motion.div
                          key={item.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Card 
                            className={`cursor-pointer transition-colors hover:bg-accent ${
                              outfit[category as keyof Outfit]?.id === item.id ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => applyClothing(item)}
                          >
                            <CardContent className="p-3">
                              <div className={`w-full h-16 ${item.color} rounded-lg mb-2 flex items-center justify-center text-white font-bold text-xs border-2 border-gray-200`}>
                                {item.name}
                              </div>
                              <div className="text-center">
                                <div className="font-medium text-sm flex items-center justify-center gap-1">
                                  {item.name}
                                  {item.premium && <Crown className="w-3 h-3 text-yellow-500" />}
                                </div>
                                {item.region && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {item.region}
                                  </Badge>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Saved Outfits */}
        {savedOutfits.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Saved Outfits ({savedOutfits.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {savedOutfits.map((savedOutfit, index) => (
                  <Card key={index} className="cursor-pointer hover:bg-accent" onClick={() => setOutfit(savedOutfit)}>
                    <CardContent className="p-3 text-center">
                      <div className="text-sm font-medium">Outfit {index + 1}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {Object.values(savedOutfit).length} items
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DressShqiponjaGame;