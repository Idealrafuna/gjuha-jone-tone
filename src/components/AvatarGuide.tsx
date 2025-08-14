import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Lottie from "lottie-react";

export type AvatarKey = "northern-man" | "northern-woman" | "southern-man" | "southern-woman";
type Emotion = "idle" | "wave" | "nod" | "celebrate";
type Size = "sm" | "md" | "lg";

interface AvatarGuideProps {
  avatarKey?: AvatarKey;
  emotion?: Emotion;
  size?: Size;
  showSpeechBubble?: boolean;
  speechText?: string;
  className?: string;
  forceVisible?: boolean;
}

function FallbackCircle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="rounded-full shadow-inner">
      <defs>
        <linearGradient id="alb" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--muted))" />
          <stop offset="100%" stopColor="hsl(var(--muted) / 0.8)" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#alb)" stroke="hsl(var(--border))" strokeWidth="2" />
      <text x="60" y="68" textAnchor="middle" fontWeight="700" fontSize="28" fill="hsl(var(--primary))">AL</text>
    </svg>
  );
}

interface AvatarSelectorProps {
  selectedAvatar: AvatarKey;
  onAvatarChange: (avatar: AvatarKey) => void;
  previewEmotion?: Emotion;
}

const avatarOptions = [
  { key: "northern-man" as AvatarKey, name: "Northern Man", description: "Traditional Gheg costume with plis hat" },
  { key: "northern-woman" as AvatarKey, name: "Northern Woman", description: "Embroidered northern dress with scarf" },
  { key: "southern-man" as AvatarKey, name: "Southern Man", description: "Traditional Tosk fustanella and vest" },
  { key: "southern-woman" as AvatarKey, name: "Southern Woman", description: "Colorful apron and headscarf" }
];

export default function AvatarGuide({ 
  avatarKey: propAvatarKey,
  emotion = "idle", 
  size = "md", 
  showSpeechBubble = false,
  speechText = "",
  className = "",
  forceVisible = true
}: AvatarGuideProps) {
  const [avatarKey, setAvatarKey] = useState<AvatarKey>("northern-woman");
  const [animationData, setAnimationData] = useState(null);
  const [posterSrc, setPosterSrc] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>(emotion);

  useEffect(() => {
    const savedAvatar = propAvatarKey || (localStorage.getItem("avatarKey") as AvatarKey) || "northern-woman";
    setAvatarKey(savedAvatar);
  }, [propAvatarKey]);

  useEffect(() => {
    setCurrentEmotion(emotion);
    setShowFallback(false);
    setPosterSrc(null);
  }, [emotion]);

  // Load animation data with triple fallback
  useEffect(() => {
    const loadAnimation = async () => {
      const src = `/avatars/animated/${avatarKey}/${currentEmotion}.json`;
      try {
        const response = await fetch(src);
        if (response.ok) {
          const data = await response.json();
          setAnimationData(data);
          setPosterSrc(null);
          setShowFallback(false);
        } else {
          console.warn("[AvatarGuide] Missing animation:", avatarKey, currentEmotion, src);
          setAnimationData(null);
          setPosterSrc(`/avatars/animated/${avatarKey}/poster.png`);
        }
      } catch (error) {
        console.warn("[AvatarGuide] Animation fetch error:", error);
        setAnimationData(null);
        setPosterSrc(`/avatars/animated/${avatarKey}/poster.png`);
      }
    };
    
    loadAnimation();
  }, [currentEmotion, avatarKey]);

  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "w-20 h-20";
      case "md": return "w-40 h-40";
      case "lg": return "w-60 h-60";
      default: return "w-40 h-40";
    }
  };

  const getSizeNumber = () => {
    switch (size) {
      case "sm": return 80;
      case "md": return 160;
      case "lg": return 240;
      default: return 160;
    }
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {showSpeechBubble && speechText && (
        <Card className="relative mb-4 p-3 bg-background/95 backdrop-blur border shadow-lg max-w-xs">
          <p className="text-sm text-foreground text-center">{speechText}</p>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-background border-r border-b"></div>
        </Card>
      )}
      
      <div className={`${getSizeClasses()} relative rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 p-2 shadow-lg transition-all duration-300 hover:scale-105`}>
        {animationData ? (
          <Lottie 
            animationData={animationData}
            loop={currentEmotion === "idle"}
            className="w-full h-full rounded-full"
          />
        ) : posterSrc ? (
          <img
            src={posterSrc}
            alt={`Albanian ${avatarKey.replace('-', ' ')} in traditional dress showing ${currentEmotion} emotion`}
            className="w-full h-full object-cover rounded-full transition-all duration-500 ease-out"
            onError={(e) => {
              console.warn("[AvatarGuide] Missing poster:", posterSrc);
              setPosterSrc(null);
              setShowFallback(true);
            }}
          />
        ) : (
          <FallbackCircle size={getSizeNumber()} />
        )}
      </div>
    </div>
  );
}

export function AvatarSelector({ 
  selectedAvatar, 
  onAvatarChange, 
  previewEmotion = "wave" 
}: AvatarSelectorProps) {
  const [hoveredAvatar, setHoveredAvatar] = useState<AvatarKey | null>(null);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Choose Your Guide</h3>
        <p className="text-muted-foreground">Your guide will learn with you and share cultural tips.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {avatarOptions.map((option) => (
          <button
            key={option.key}
            className={`p-4 rounded-2xl border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              selectedAvatar === option.key
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => onAvatarChange(option.key)}
            onMouseEnter={() => setHoveredAvatar(option.key)}
            onMouseLeave={() => setHoveredAvatar(null)}
            onFocus={() => setHoveredAvatar(option.key)}
            onBlur={() => setHoveredAvatar(null)}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                <img
                  src={`/avatars/animated/${option.key}/poster.png`}
                  alt={option.name}
                  className={`w-20 h-20 rounded-full object-cover transition-all duration-300 ${
                    hoveredAvatar === option.key ? 'animate-pulse' : ''
                  }`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="text-center">
                <h4 className="text-sm font-medium">{option.name}</h4>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Live Preview */}
      <div className="flex justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Preview</p>
          <AvatarGuide 
            avatarKey={selectedAvatar}
            size="lg"
            emotion={hoveredAvatar ? previewEmotion : "idle"}
          />
        </div>
      </div>
    </div>
  );
}