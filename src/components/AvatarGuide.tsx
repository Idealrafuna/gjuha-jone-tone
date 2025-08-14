import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

type Emotion = "idle" | "happy" | "encouraging" | "sad" | "wave";
type Size = "sm" | "md" | "lg";
type AvatarKey = "northern-man" | "northern-woman" | "southern-man" | "southern-woman";

interface AvatarGuideProps {
  emotion?: Emotion;
  size?: Size;
  showSpeechBubble?: boolean;
  speechText?: string;
  className?: string;
  avatarOverride?: AvatarKey; // For preview in onboarding
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
  emotion = "idle", 
  size = "md", 
  showSpeechBubble = false,
  speechText = "",
  className = "",
  avatarOverride
}: AvatarGuideProps) {
  const [avatarKey, setAvatarKey] = useState<AvatarKey>("northern-woman");
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>(emotion);

  useEffect(() => {
    const savedAvatar = localStorage.getItem("avatarKey") as AvatarKey | null;
    if (savedAvatar && !avatarOverride) {
      setAvatarKey(savedAvatar);
    }
  }, [avatarOverride]);

  useEffect(() => {
    setCurrentEmotion(emotion);
  }, [emotion]);

  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "w-20 h-20";
      case "md": return "w-40 h-40";
      case "lg": return "w-60 h-60";
      default: return "w-40 h-40";
    }
  };

  const getAnimationClasses = () => {
    switch (currentEmotion) {
      case "wave": return "animate-pulse";
      case "happy": return "animate-bounce";
      case "encouraging": return "animate-pulse";
      case "sad": return "";
      default: return "hover:scale-105";
    }
  };

  const currentAvatar = avatarOverride || avatarKey;

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {showSpeechBubble && speechText && (
        <Card className="relative mb-4 p-3 bg-background/95 backdrop-blur border shadow-lg max-w-xs">
          <p className="text-sm text-foreground text-center">{speechText}</p>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-background border-r border-b"></div>
        </Card>
      )}
      
      <div className={`${getSizeClasses()} relative rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 p-2 shadow-lg transition-all duration-300 ${getAnimationClasses()}`}>
        <img
          src={`/avatars/${currentAvatar}.webp`}
          alt={`Albanian ${currentAvatar.replace('-', ' ')} in traditional dress showing ${currentEmotion} emotion`}
          className="w-full h-full object-cover rounded-full transition-all duration-500 ease-out"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentAvatar}&backgroundColor=f0f0f0`;
          }}
        />
        
        {/* Emotion indicator overlay */}
        {currentEmotion !== "idle" && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs animate-bounce">
            {currentEmotion === "happy" && "😊"}
            {currentEmotion === "encouraging" && "👍"}
            {currentEmotion === "sad" && "😔"}
            {currentEmotion === "wave" && "👋"}
          </div>
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
                  src={`/avatars/${option.key}.webp`}
                  alt={option.name}
                  className={`w-20 h-20 rounded-full object-cover transition-all duration-300 ${
                    hoveredAvatar === option.key ? 'animate-pulse' : ''
                  }`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${option.key}&backgroundColor=f0f0f0`;
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
            size="lg"
            emotion={hoveredAvatar ? previewEmotion : "idle"}
            avatarOverride={selectedAvatar}
          />
        </div>
      </div>
    </div>
  );
}