import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Heart, Trophy, Play, Pause, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Mode = "free" | "premium";

type City = {
  id: string;
  name: string;
  x: number; // percentage position on map
  y: number; // percentage position on map
  difficulty: "easy" | "medium" | "hard";
};

type DraggableCity = {
  id: string;
  name: string;
  isDropped: boolean;
  isCorrect?: boolean;
};

type Props = {
  mode?: Mode;
  durationMs?: number; // default 300000 (5 minutes)
  userId?: string | null;
  onClose?: () => void;
  onAwardXP?: (xp: number) => void;
};

// Albanian cities with map coordinates (approximate percentages)
const CITIES: City[] = [
  { id: "prishtine", name: "Prishtinë", x: 75, y: 25, difficulty: "easy" },
  { id: "shkoder", name: "Shkodër", x: 35, y: 15, difficulty: "easy" },
  { id: "vlore", name: "Vlorë", x: 25, y: 75, difficulty: "easy" },
  { id: "tetove", name: "Tetovë", x: 85, y: 40, difficulty: "medium" },
  { id: "gjakove", name: "Gjakovë", x: 65, y: 35, difficulty: "medium" },
  { id: "elbasan", name: "Elbasan", x: 50, y: 50, difficulty: "easy" },
  { id: "durres", name: "Durrës", x: 35, y: 45, difficulty: "easy" },
  { id: "fier", name: "Fier", x: 35, y: 60, difficulty: "medium" },
  { id: "korce", name: "Korcë", x: 70, y: 70, difficulty: "medium" },
  { id: "berat", name: "Berat", x: 45, y: 60, difficulty: "medium" },
  { id: "mitrovice", name: "Mitrovicë", x: 70, y: 20, difficulty: "hard" },
  { id: "peje", name: "Pejë", x: 60, y: 25, difficulty: "hard" },
  { id: "gjilan", name: "Gjilan", x: 80, y: 35, difficulty: "hard" },
  { id: "kukes", name: "Kukës", x: 50, y: 20, difficulty: "hard" },
  { id: "lezhe", name: "Lezhë", x: 40, y: 30, difficulty: "hard" },
];

const DROP_TOLERANCE = 8; // percentage tolerance for correct drop

export default function MapQuestGame({
  mode = "free",
  durationMs = 300_000,
  userId = null,
  onClose,
  onAwardXP,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationMs);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [ended, setEnded] = useState(false);
  const [selectedCities, setSelectedCities] = useState<City[]>([]);
  const [draggableCities, setDraggableCities] = useState<DraggableCity[]>([]);
  const [draggedCity, setDraggedCity] = useState<string | null>(null);
  const [droppedPositions, setDroppedPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [mapBounds, setMapBounds] = useState<DOMRect | null>(null);

  const config = useMemo(() => {
    if (mode === "premium") {
      return {
        citiesPerRound: 10,
        includeDifficult: true,
        xpPerCorrect: 25,
        xpBonus: 50, // bonus for completing round
      };
    }
    return {
      citiesPerRound: 5,
      includeDifficult: false,
      xpPerCorrect: 20,
      xpBonus: 30,
    };
  }, [mode]);

  // Initialize new round
  const startNewRound = useCallback(() => {
    const availableCities = config.includeDifficult 
      ? CITIES 
      : CITIES.filter(city => city.difficulty !== "hard");
    
    const shuffled = [...availableCities].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, config.citiesPerRound);
    
    setSelectedCities(selected);
    setDraggableCities(
      selected.map(city => ({
        id: city.id,
        name: city.name,
        isDropped: false,
      }))
    );
    setDroppedPositions({});
    setDraggedCity(null);
  }, [config]);

  // Timer
  useEffect(() => {
    if (!playing || ended) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          endGame();
          return 0;
        }
        return newTime;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [playing, ended]);

  // Check if round is complete
  useEffect(() => {
    const allDropped = draggableCities.every(city => city.isDropped);
    if (allDropped && draggableCities.length > 0 && playing) {
      const correctDrops = draggableCities.filter(city => city.isCorrect).length;
      const roundScore = correctDrops * 100;
      setScore(prev => prev + roundScore + config.xpBonus);
      onAwardXP?.(correctDrops * config.xpPerCorrect + config.xpBonus);
      
      setTimeout(() => {
        setRound(prev => prev + 1);
        startNewRound();
      }, 2000);
    }
  }, [draggableCities, playing, config, onAwardXP, startNewRound]);

  // Game over check
  useEffect(() => {
    if (lives <= 0 && !ended) endGame();
  }, [lives, ended]);

  const startGame = useCallback(() => {
    setPlaying(true);
    setEnded(false);
    startNewRound();
  }, [startNewRound]);

  const endGame = useCallback(() => {
    setPlaying(false);
    setEnded(true);
  }, []);

  const restart = useCallback(() => {
    setTimeLeft(durationMs);
    setLives(3);
    setScore(0);
    setRound(1);
    setDraggedCity(null);
    setDroppedPositions({});
    startGame();
  }, [durationMs, startGame]);

  const handleDragStart = useCallback((cityId: string) => {
    setDraggedCity(cityId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedCity(null);
  }, []);

  const handleMapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggedCity || !mapBounds) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const targetCity = selectedCities.find(city => city.id === draggedCity);
    if (!targetCity) return;

    const distance = Math.sqrt(
      Math.pow(x - targetCity.x, 2) + Math.pow(y - targetCity.y, 2)
    );

    const isCorrect = distance <= DROP_TOLERANCE;

    setDraggableCities(prev =>
      prev.map(city =>
        city.id === draggedCity
          ? { ...city, isDropped: true, isCorrect }
          : city
      )
    );

    setDroppedPositions(prev => ({
      ...prev,
      [draggedCity]: { x, y }
    }));

    if (isCorrect) {
      setScore(prev => prev + 100);
      onAwardXP?.(config.xpPerCorrect);
    } else {
      setLives(prev => Math.max(0, prev - 1));
    }

    setDraggedCity(null);
  }, [draggedCity, mapBounds, selectedCities, config.xpPerCorrect, onAwardXP]);

  const togglePause = useCallback(() => {
    setPlaying(p => !p);
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-green-800 via-green-700 to-green-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-green-300" />
          <div>
            <h2 className="font-bold text-xl">Map Quest: Albanian Cities</h2>
            <p className="text-sm text-green-200">Drag city names to their locations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-green-300">Round:</span> {round}
          </div>
          
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span className="font-semibold">{score}</span>
          </div>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`h-5 w-5 ${i < lives ? "text-red-400" : "text-white/30"}`}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-300" />
            <span className="font-medium">
              {Math.floor(timeLeft / 60000)}:{((timeLeft % 60000) / 1000).toFixed(0).padStart(2, '0')}
            </span>
          </div>
          
          <Button
            onClick={togglePause}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4">
        {/* Map Area */}
        <div className="flex-1 relative">
          <div 
            className="w-full h-full max-h-[500px] lg:max-h-none bg-green-100 rounded-xl border-4 border-green-600 relative cursor-crosshair"
            onClick={handleMapClick}
            ref={(el) => {
              if (el) setMapBounds(el.getBoundingClientRect());
            }}
          >
            {/* Albania + Kosovo outline SVG */}
            <svg
              viewBox="0 0 400 300"
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: 'none' }}
            >
              {/* Simplified Albania + Kosovo outline */}
              <path
                d="M 100 50 L 120 40 L 140 45 L 160 35 L 180 40 L 200 30 L 220 35 L 240 50 L 260 45 L 280 60 L 300 80 L 320 100 L 330 120 L 325 140 L 310 160 L 290 180 L 270 200 L 250 220 L 220 240 L 190 250 L 160 245 L 130 235 L 110 220 L 90 200 L 80 180 L 75 160 L 80 140 L 85 120 L 90 100 L 95 80 L 100 60 Z"
                fill="none"
                stroke="#2d5016"
                strokeWidth="3"
                className="drop-shadow-md"
              />
              
              {/* Internal borders */}
              <path
                d="M 180 40 L 200 80 L 220 120 L 240 100 L 260 90"
                fill="none"
                stroke="#2d5016"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            </svg>

            {/* Correct city markers */}
            {selectedCities.map((city) => (
              <div
                key={city.id}
                className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg opacity-30"
                style={{
                  left: `${city.x}%`,
                  top: `${city.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}

            {/* Dropped cities */}
            {Object.entries(droppedPositions).map(([cityId, pos]) => {
              const city = draggableCities.find(c => c.id === cityId);
              if (!city) return null;
              
              return (
                <motion.div
                  key={cityId}
                  className={`absolute w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold ${
                    city.isCorrect ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {city.isCorrect ? "✓" : "✗"}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* City Labels Sidebar */}
        <div className="w-full lg:w-80 bg-black/20 backdrop-blur rounded-xl p-4">
          <h3 className="font-bold text-lg mb-4 text-center">Cities to Place</h3>
          <div className="space-y-2">
            {draggableCities.map((city) => (
              <motion.div
                key={city.id}
                className={`p-3 rounded-lg text-center font-medium cursor-grab select-none ${
                  city.isDropped
                    ? city.isCorrect
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                    : draggedCity === city.id
                    ? "bg-blue-500 text-white shadow-lg scale-105"
                    : "bg-white/90 text-gray-900 hover:bg-white"
                }`}
                draggable={!city.isDropped}
                onDragStart={() => handleDragStart(city.id)}
                onDragEnd={handleDragEnd}
                whileHover={!city.isDropped ? { scale: 1.02 } : {}}
                whileTap={!city.isDropped ? { scale: 0.98 } : {}}
              >
                {city.name}
                {city.isDropped && (
                  <span className="ml-2">
                    {city.isCorrect ? "✓" : "✗"}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
          
          {draggableCities.length === 0 && (
            <div className="text-center text-white/70 py-8">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Loading cities...</p>
            </div>
          )}
        </div>
      </div>

      {/* Start/Game Over Modal */}
      <AnimatePresence>
        {(!playing && !ended) && (
          <motion.div
            className="absolute inset-0 bg-black/70 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/95 text-gray-900 rounded-2xl p-8 max-w-md w-full text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Map Quest: Albanian Cities</h3>
              <p className="text-gray-700 mb-4">
                Drag the city names to their correct locations on the map of Albania and Kosovo.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Mode: <span className="font-semibold">{mode === "premium" ? "Premium (10 cities)" : "Free (5 cities)"}</span>
              </p>
              <Button onClick={startGame} className="w-full bg-green-600 hover:bg-green-700">
                Start Quest!
              </Button>
            </motion.div>
          </motion.div>
        )}
        
        {ended && (
          <motion.div
            className="absolute inset-0 bg-black/70 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/95 text-gray-900 rounded-2xl p-8 max-w-md w-full text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Quest Complete!</h3>
              <p className="text-gray-700 mb-2">
                Final Score: <span className="font-bold">{score}</span>
              </p>
              <p className="text-gray-700 mb-6">
                Rounds Completed: <span className="font-bold">{round - 1}</span>
              </p>
              <div className="flex gap-2">
                <Button onClick={restart} className="flex-1 bg-green-600 hover:bg-green-700">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Play Again
                </Button>
                {onClose && (
                  <Button onClick={onClose} variant="outline" className="flex-1">
                    Exit
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}