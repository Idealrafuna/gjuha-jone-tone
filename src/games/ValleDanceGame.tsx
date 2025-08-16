import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Heart, Trophy, Play, Pause, X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Mode = "free" | "premium";
type Direction = "up" | "down" | "left" | "right";

type ArrowNote = {
  id: string;
  direction: Direction;
  spawnTime: number;
  duration: number; // ms to reach target zone
  hit?: boolean;
};

type Props = {
  mode?: Mode;
  durationMs?: number; // default 180000 (3 minutes)
  userId?: string | null;
  onClose?: () => void;
  onAwardXP?: (xp: number) => void;
};

const DIRECTION_ICONS = {
  up: ArrowUp,
  down: ArrowDown,
  left: ArrowLeft,
  right: ArrowRight,
};

const DIRECTION_KEYS = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
} as const;

// Audio placeholder - replace with real Albanian folk music
const MUSIC_TRACKS = {
  free: ["/audio/valle-track-1.mp3"],
  premium: ["/audio/valle-track-1.mp3", "/audio/valle-track-2.mp3", "/audio/valle-track-3.mp3"],
};

export default function ValleDanceGame({
  mode = "free",
  durationMs = 180_000,
  userId = null,
  onClose,
  onAwardXP,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationMs);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [ended, setEnded] = useState(false);
  const [activeNotes, setActiveNotes] = useState<ArrowNote[]>([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gameAreaRef = useRef<HTMLDivElement | null>(null);

  const config = useMemo(() => {
    if (mode === "premium") {
      return {
        spawnEveryMs: 800, // faster spawns
        noteDuration: 2500, // fall faster
        xpPerHit: 15,
        xpComboBonus: 3,
        hitWindow: 150, // ms window for "perfect" hit
      };
    }
    return {
      spawnEveryMs: 1200,
      noteDuration: 3500,
      xpPerHit: 12,
      xpComboBonus: 2,
      hitWindow: 200,
    };
  }, [mode]);

  const tracks = MUSIC_TRACKS[mode];

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

  // Spawn notes
  useEffect(() => {
    if (!playing || ended) return;
    const interval = setInterval(() => {
      const directions: Direction[] = ["up", "down", "left", "right"];
      const randomDirection = directions[Math.floor(Math.random() * directions.length)];
      
      const newNote: ArrowNote = {
        id: Math.random().toString(36).slice(2, 9),
        direction: randomDirection,
        spawnTime: Date.now(),
        duration: config.noteDuration,
      };
      
      setActiveNotes((prev) => [...prev, newNote]);
    }, config.spawnEveryMs);
    return () => clearInterval(interval);
  }, [playing, ended, config]);

  // Remove missed notes
  useEffect(() => {
    if (!playing || ended) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveNotes((prev) => {
        const survivors: ArrowNote[] = [];
        let missedNotes = 0;
        
        for (const note of prev) {
          const elapsed = now - note.spawnTime;
          const progress = elapsed / note.duration;
          
          if (progress >= 1.1 && !note.hit) {
            missedNotes++;
          } else {
            survivors.push(note);
          }
        }
        
        if (missedNotes > 0) {
          setCombo(0);
          setLives((l) => Math.max(0, l - missedNotes));
        }
        
        return survivors;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [playing, ended]);

  // Game over check
  useEffect(() => {
    if (lives <= 0 && !ended) endGame();
  }, [lives, ended]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!playing || ended) return;
      const direction = DIRECTION_KEYS[e.key as keyof typeof DIRECTION_KEYS];
      if (direction) {
        e.preventDefault();
        handleHit(direction);
      }
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [playing, ended]);

  const handleHit = useCallback(
    (direction: Direction) => {
      const now = Date.now();
      const targetZoneY = 0.85; // 85% down the screen
      
      setActiveNotes((prev) => {
        let bestNote: ArrowNote | null = null;
        let bestDistance = Infinity;
        
        // Find the closest note in the target zone
        for (const note of prev) {
          if (note.direction === direction && !note.hit) {
            const elapsed = now - note.spawnTime;
            const progress = elapsed / note.duration;
            const distance = Math.abs(progress - targetZoneY);
            
            if (distance < config.hitWindow / config.noteDuration && distance < bestDistance) {
              bestNote = note;
              bestDistance = distance;
            }
          }
        }
        
        if (bestNote) {
          const newCombo = combo + 1;
          setCombo(newCombo);
          const points = 100 + newCombo * 10;
          setScore((s) => s + points);
          
          const xp = config.xpPerHit + newCombo * config.xpComboBonus;
          onAwardXP?.(xp);
          
          return prev.map((note) =>
            note.id === bestNote.id ? { ...note, hit: true } : note
          );
        } else {
          // Miss
          setCombo(0);
          setLives((l) => Math.max(0, l - 1));
          return prev;
        }
      });
    },
    [combo, config, onAwardXP]
  );

  const startGame = useCallback(() => {
    setPlaying(true);
    setEnded(false);
    
    // Start music
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.warn);
    }
  }, []);

  const endGame = useCallback(() => {
    setPlaying(false);
    setEnded(true);
    
    // Stop music
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const restart = useCallback(() => {
    setTimeLeft(durationMs);
    setLives(3);
    setScore(0);
    setCombo(0);
    setActiveNotes([]);
    startGame();
  }, [durationMs, startGame]);

  const togglePause = useCallback(() => {
    setPlaying((p) => {
      const newPlaying = !p;
      if (audioRef.current) {
        if (newPlaying) {
          audioRef.current.play().catch(console.warn);
        } else {
          audioRef.current.pause();
        }
      }
      return newPlaying;
    });
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 text-white relative">
      {/* Background Audio */}
      <audio
        ref={audioRef}
        src={tracks[currentTrack]}
        loop
        preload="auto"
        className="hidden"
      />
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur">
        <div className="flex items-center gap-3">
          <Music className="h-6 w-6 text-purple-300" />
          <div>
            <h2 className="font-bold text-xl">Valle Dance Moves</h2>
            <p className="text-sm text-purple-200">Hit the arrows when they reach the target!</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
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
          
          <div className="text-sm font-medium">
            {Math.floor(timeLeft / 60000)}:{((timeLeft % 60000) / 1000).toFixed(0).padStart(2, '0')}
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

      {/* Game Area */}
      <div ref={gameAreaRef} className="flex-1 relative overflow-hidden">
        {/* Arrow Lanes */}
        <div className="absolute inset-0 flex">
          {(["left", "down", "up", "right"] as Direction[]).map((direction, index) => (
            <div key={direction} className="flex-1 border-r border-white/20 last:border-r-0 relative">
              {/* Lane header with static arrow */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                {React.createElement(DIRECTION_ICONS[direction], {
                  className: "h-8 w-8 text-purple-300"
                })}
              </div>
              
              {/* Target Zone */}
              <div className="absolute left-0 right-0 h-16 bg-white/10 border-2 border-purple-400 rounded"
                   style={{ bottom: "15%" }} />
            </div>
          ))}
        </div>

        {/* Falling Notes */}
        <AnimatePresence>
          {activeNotes.map((note) => (
            <FallingNote
              key={note.id}
              note={note}
              playing={playing && !ended}
              gameHeight={gameAreaRef.current?.clientHeight || 600}
            />
          ))}
        </AnimatePresence>

        {/* Combo Display */}
        {combo > 1 && (
          <motion.div
            key={combo}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 text-yellow-300 font-bold text-4xl drop-shadow-lg"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Combo x{combo}!
          </motion.div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden bg-black/30 backdrop-blur p-4">
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          <div /> {/* Empty space */}
          <Button
            onTouchStart={() => handleHit("up")}
            className="aspect-square bg-purple-600 hover:bg-purple-500"
            size="lg"
          >
            <ArrowUp className="h-6 w-6" />
          </Button>
          <div /> {/* Empty space */}
          
          <Button
            onTouchStart={() => handleHit("left")}
            className="aspect-square bg-purple-600 hover:bg-purple-500"
            size="lg"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <Button
            onTouchStart={() => handleHit("down")}
            className="aspect-square bg-purple-600 hover:bg-purple-500"
            size="lg"
          >
            <ArrowDown className="h-6 w-6" />
          </Button>
          <Button
            onTouchStart={() => handleHit("right")}
            className="aspect-square bg-purple-600 hover:bg-purple-500"
            size="lg"
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
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
              <Music className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Valle Dance Moves</h3>
              <p className="text-gray-700 mb-6">
                Press the arrow keys (or tap buttons on mobile) when the arrows reach the target zone!
              </p>
              <Button onClick={startGame} className="w-full bg-purple-600 hover:bg-purple-700">
                Start Dancing!
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
              <h3 className="text-2xl font-bold mb-2">Dance Complete!</h3>
              <p className="text-gray-700 mb-2">
                Final Score: <span className="font-bold">{score}</span>
              </p>
              <p className="text-gray-700 mb-6">
                Max Combo: <span className="font-bold">{combo}</span>
              </p>
              <div className="flex gap-2">
                <Button onClick={restart} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Dance Again
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

function FallingNote({
  note,
  playing,
  gameHeight,
}: {
  note: ArrowNote;
  playing: boolean;
  gameHeight: number;
}) {
  const [position, setPosition] = useState(0);
  const laneIndex = ["left", "down", "up", "right"].indexOf(note.direction);

  useEffect(() => {
    if (!playing || note.hit) return;
    
    let animationFrame: number;
    const animate = () => {
      const now = Date.now();
      const elapsed = now - note.spawnTime;
      const progress = elapsed / note.duration;
      
      // Start from top (0%) and fall to bottom (100%)
      setPosition(Math.min(100, progress * 100));
      
      if (progress < 1.1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [playing, note.spawnTime, note.duration, note.hit]);

  const IconComponent = DIRECTION_ICONS[note.direction];

  return (
    <motion.div
      className={`absolute w-12 h-12 flex items-center justify-center rounded-full shadow-lg ${
        note.hit
          ? "bg-green-500 text-white scale-125"
          : "bg-white text-gray-900 border-2 border-purple-400"
      }`}
      style={{
        left: `${(laneIndex * 25) + 12.5}%`,
        top: `${position}%`,
        transform: "translateX(-50%)",
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: note.hit ? 1.2 : 1, opacity: note.hit ? 0.7 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <IconComponent className="h-6 w-6" />
    </motion.div>
  );
}