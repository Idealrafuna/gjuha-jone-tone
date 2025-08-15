import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Flame, Heart, Trophy, Play, Pause, X } from "lucide-react";
// If your project exposes shadcn/ui, you can swap these with real components.
// For now, we keep it dependency-light and Tailwind-only.

// Optional: import your Supabase client if available
// Adjust the path to match your project structure
// import { supabase } from "@/lib/supabaseClient";

type Mode = "free" | "premium";

type VocabItem = { en: string; sq: string };

type FallingWord = {
  id: string;
  text: string; // what is displayed (sq or en)
  isAlbanian: boolean; // whether this is an Albanian word (tap only if true)
  xPct: number; // horizontal position 0..100
  startTs: number; // ms timestamp when spawned
  duration: number; // ms to fall from top to bottom
  clicked?: boolean;
};

type Props = {
  mode?: Mode;
  durationMs?: number; // default 60000
  userId?: string | null; // pass from your auth context
  onClose?: () => void; // to exit the game modal/screen
  onAwardXP?: (xp: number) => void; // integrate with your XP system
  // optionally inject your own vocabulary
  vocab?: VocabItem[];
};

// Default vocabulary (expand later or inject via props)
const DEFAULT_VOCAB: VocabItem[] = [
  { en: "water", sq: "ujë" },
  { en: "sun", sq: "diell" },
  { en: "mountain", sq: "mal" },
  { en: "friend", sq: "mik" },
  { en: "family", sq: "familje" },
  { en: "book", sq: "libër" },
  { en: "house", sq: "shpi" }, // Gheg touch
  { en: "home", sq: "shtëpi" }, // Tosk standard
  { en: "bread", sq: "bukë" },
  { en: "love", sq: "dashuri" },
];

const randId = () => Math.random().toString(36).slice(2, 9);

export default function ShqipDashGame({
  mode = "free",
  durationMs = 60_000,
  userId = null,
  onClose,
  onAwardXP,
  vocab = DEFAULT_VOCAB,
}: Props) {
  const [playing, setPlaying] = useState(true);
  const [timeLeft, setTimeLeft] = useState(durationMs);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [ended, setEnded] = useState(false);
  const [activeWords, setActiveWords] = useState<FallingWord[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const config = useMemo(() => {
    // Tweak difficulty by mode
    if (mode === "premium") {
      return {
        spawnEveryMs: 700, // faster spawns
        durationRange: [2000, 3000] as [number, number], // fall faster
        albanianRatio: 0.65, // slightly trickier (more English decoys)
        xpPerHit: 12,
        xpComboBonus: 2, // add 2 XP per combo tier
      };
    }
    return {
      spawnEveryMs: 1000,
      durationRange: [2800, 3800] as [number, number],
      albanianRatio: 0.75,
      xpPerHit: 10,
      xpComboBonus: 1,
    };
  }, [mode]);

  // Countdown timer
  // Countdown timer
useEffect(() => {
  if (!playing || ended) return;
  const start = performance.now();
  let raf = 0;
  const tick = (now: number) => {
    const elapsed = now - start;
    setTimeLeft((prev) => Math.max(0, prev - (now - (now - elapsed))));
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}, [playing, ended]);


  // End by time
  useEffect(() => {
    if (timeLeft <= 0 && !ended) endGame();
  }, [timeLeft, ended]);

  // Spawn words
  useEffect(() => {
    if (!playing || ended) return;
    const t = setInterval(() => {
      setActiveWords((prev) => [...prev, makeWord(vocab, config)]);
    }, config.spawnEveryMs);
    return () => clearInterval(t);
  }, [playing, ended, vocab, config]);

  // Remove missed words & lose lives
  useEffect(() => {
    if (!playing || ended) return;
    const i = setInterval(() => {
      const now = Date.now();
      setActiveWords((prev) => {
        const survivors: FallingWord[] = [];
        let lifeLoss = 0;
        for (const w of prev) {
          const elapsed = now - w.startTs;
          const progress = elapsed / w.duration;
          const reachedBottom = progress >= 1 && !w.clicked;
          if (reachedBottom) {
            if (w.isAlbanian) {
              lifeLoss += 1; // missed a correct target
            }
          } else {
            survivors.push(w);
          }
        }
        if (lifeLoss > 0) {
          setCombo(0);
          setLives((l) => Math.max(0, l - lifeLoss));
        }
        return survivors;
      });
    }, 100);
    return () => clearInterval(i);
  }, [playing, ended]);

  // End if out of lives
  useEffect(() => {
    if (lives <= 0 && !ended) endGame();
  }, [lives, ended]);

  const handleClickWord = useCallback(
    (id: string) => {
      setActiveWords((prev) => {
        const idx = prev.findIndex((w) => w.id === id);
        if (idx === -1) return prev;
        const w = prev[idx];
        if (w.clicked) return prev;
        const next = [...prev];
        next[idx] = { ...w, clicked: true };
        // Scoring
        if (w.isAlbanian) {
          const newCombo = Math.min(50, combo + 1);
          setCombo(newCombo);
          const points = 10 + newCombo; // base 10 + combo bonus
          setScore((s) => s + points);
          // XP hook
          const xp = config.xpPerHit + newCombo * config.xpComboBonus;
          onAwardXP?.(xp);
        } else {
          // wrong click
          setCombo(0);
          setLives((l) => Math.max(0, l - 1));
        }
        return next;
      });
    },
    [combo, onAwardXP, config.xpPerHit, config.xpComboBonus]
  );

  const endGame = useCallback(() => {
    setPlaying(false);
    setEnded(true);
    // Persist score (optional)
    // if (userId) {
    //   supabase.from("scores").insert({
    //     user_id: userId,
    //     game: "shqip_dash",
    //     score,
    //     mode,
    //   });
    // }
  }, [/* score, mode, userId */]);

  const restart = useCallback(() => {
    setPlaying(true);
    setTimeLeft(durationMs);
    setLives(3);
    setScore(0);
    setCombo(0);
    setEnded(false);
    setActiveWords([]);
  }, [durationMs]);

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-b from-red-700 via-red-600 to-red-800 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <h2 className="font-bold text-lg md:text-xl">Shqip Dash</h2>
          <span className="ml-2 text-white/80 text-sm">Tap only the Albanian words!</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Flame className="h-5 w-5 text-yellow-300" />
            <span className="font-semibold">{Math.max(0, Math.ceil(timeLeft / 1000))}s</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="h-5 w-5 text-amber-300" />
            <span className="font-semibold">{score}</span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`h-5 w-5 ${i < lives ? "text-rose-300" : "text-white/30"}`}
              />
            ))}
          </div>
          <button
            onClick={() => setPlaying((p) => !p)}
            className="inline-flex items-center gap-1 rounded-2xl bg-black/20 hover:bg-black/30 px-3 py-1.5 text-sm"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {playing ? "Pause" : "Play"}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-2xl bg-black/20 hover:bg-black/30 px-3 py-1.5 text-sm"
            >
              <X className="h-4 w-4" /> Exit
            </button>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div ref={containerRef} className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false}>
          {activeWords.map((w) => (
            <FallingWordView
              key={w.id}
              word={w}
              playing={playing && !ended}
              onClick={() => handleClickWord(w.id)}
            />
          ))}
        </AnimatePresence>

        {/* Combo indicator */}
        {combo > 1 && (
          <motion.div
            key={combo}
            className="absolute top-3 left-1/2 -translate-x-1/2 text-yellow-200 font-extrabold text-3xl drop-shadow"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Combo x{combo}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 md:p-4 bg-black/20 backdrop-blur border-t border-white/10 flex items-center justify-between">
        <span className="text-sm opacity-90">Mode: {mode === "premium" ? "Premium (faster!)" : "Free"}</span>
        <button
          onClick={restart}
          className="rounded-xl bg-white/15 hover:bg-white/25 px-3 py-2 text-sm font-semibold"
        >
          Restart
        </button>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {ended && (
          <motion.div
            className="absolute inset-0 bg-black/60 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl bg-white/95 text-gray-900 p-6 shadow-xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-6 w-6 text-amber-500" />
                <h3 className="text-xl font-extrabold">Game Over</h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                You scored <span className="font-bold">{score}</span> points.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={restart}
                  className="flex-1 rounded-xl bg-red-600 text-white py-2 font-semibold hover:bg-red-700"
                >
                  Play Again
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-xl bg-gray-200 text-gray-900 py-2 font-semibold hover:bg-gray-300"
                  >
                    Exit
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FallingWordView({
  word,
  playing,
  onClick,
}: {
  word: FallingWord;
  playing: boolean;
  onClick: () => void;
}) {
  const [yPct, setYPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const now = Date.now();
      const elapsed = now - word.startTs;
      const progress = Math.min(1, elapsed / word.duration);
      setYPct(progress * 100);
      if (progress < 1 && playing && !word.clicked) {
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, word.startTs, word.duration, word.clicked]);

  const color = word.isAlbanian ? "bg-black/80" : "bg-white/80 text-gray-900";

  return (
    <motion.button
      onClick={onClick}
      className={`absolute px-3 py-1.5 rounded-full shadow-lg border border-white/10 ${color}`}
      style={{ left: `${word.xPct}%`, transform: `translate(-50%, ${yPct}vh)` }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <span className="font-bold">
        {word.text}
        {word.isAlbanian && " •"}
      </span>
    </motion.button>
  );
}

function makeWord(vocab: VocabItem[], cfg: ReturnType<typeof useMemo> extends infer T ? any : never) {
  // Pick a random vocab
  const item = vocab[Math.floor(Math.random() * vocab.length)];
  const showAlbanian = Math.random() < cfg.albanianRatio; // whether we spawn an Albanian target
  const text = showAlbanian ? item.sq : item.en;
  const [minD, maxD] = cfg.durationRange as [number, number];
  const duration = Math.floor(randRange(minD, maxD));
  return {
    id: randId(),
    text,
    isAlbanian: showAlbanian,
    xPct: Math.floor(randRange(10, 90)),
    startTs: Date.now(),
    duration,
  } as FallingWord;
}

function randRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
