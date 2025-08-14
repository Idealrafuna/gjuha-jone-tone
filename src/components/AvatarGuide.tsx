import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

type Emotion = "neutral" | "happy" | "encouraging" | "sad";
type Size = "sm" | "md" | "lg";

interface AvatarGuideProps {
  emotion?: Emotion;
  size?: Size;
  showSpeechBubble?: boolean;
  speechText?: string;
  className?: string;
}

interface AvatarPreferences {
  avatarGender: "male" | "female";
  avatarStyle: "gheg" | "tosk";
}

export const AvatarGuide = ({ 
  emotion = "neutral", 
  size = "md", 
  showSpeechBubble = false,
  speechText = "",
  className = ""
}: AvatarGuideProps) => {
  const [avatarPrefs, setAvatarPrefs] = useState<AvatarPreferences>({
    avatarGender: "female",
    avatarStyle: "gheg"
  });
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>(emotion);

  useEffect(() => {
    const savedGender = localStorage.getItem("avatarGender") as "male" | "female" | null;
    const savedStyle = localStorage.getItem("avatarStyle") as "gheg" | "tosk" | null;
    const savedDialect = localStorage.getItem("userDialect") as "gheg" | "tosk" | null;
    
    setAvatarPrefs({
      avatarGender: savedGender || "female",
      avatarStyle: savedStyle || savedDialect || "gheg"
    });
  }, []);

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

  const getAvatarPath = () => {
    // For now, using placeholder avatars - these would be actual Albanian costume avatars
    const baseUrl = "/avatars";
    return `${baseUrl}/${avatarPrefs.avatarGender}-${avatarPrefs.avatarStyle}/${currentEmotion}.webp`;
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
        <img
          src={getAvatarPath()}
          alt={`Albanian ${avatarPrefs.avatarGender} in ${avatarPrefs.avatarStyle} traditional dress showing ${currentEmotion} emotion`}
          className="w-full h-full object-cover rounded-full transition-all duration-500 ease-out"
          onError={(e) => {
            // Fallback to a simple avatar if image doesn't exist
            const target = e.target as HTMLImageElement;
            target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarPrefs.avatarGender}-${avatarPrefs.avatarStyle}&backgroundColor=f0f0f0`;
          }}
        />
        
        {/* Emotion indicator overlay */}
        {currentEmotion !== "neutral" && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs animate-bounce">
            {currentEmotion === "happy" && "😊"}
            {currentEmotion === "encouraging" && "👍"}
            {currentEmotion === "sad" && "😔"}
          </div>
        )}
      </div>
    </div>
  );
};

// Avatar selection component for onboarding
interface AvatarOption {
  gender: "male" | "female";
  style: "gheg" | "tosk";
  name: string;
  description: string;
}

interface AvatarSelectorProps {
  selectedGender: "male" | "female";
  selectedStyle: "gheg" | "tosk";
  onGenderChange: (gender: "male" | "female") => void;
  onStyleChange: (style: "gheg" | "tosk") => void;
}

export const AvatarSelector = ({ 
  selectedGender, 
  selectedStyle, 
  onGenderChange, 
  onStyleChange 
}: AvatarSelectorProps) => {
  const avatarOptions: AvatarOption[] = [
    { gender: "male", style: "gheg", name: "Northern Man", description: "Traditional Gheg costume with white shirt and red vest" },
    { gender: "male", style: "tosk", name: "Southern Man", description: "Traditional Tosk fustanella and black vest" },
    { gender: "female", style: "gheg", name: "Northern Woman", description: "Embroidered northern dress with traditional scarf" },
    { gender: "female", style: "tosk", name: "Southern Woman", description: "Southern dress with colorful apron and headscarf" }
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Choose your cultural guide:</p>
      <div className="grid grid-cols-2 gap-3">
        {avatarOptions.map((option) => (
          <button
            key={`${option.gender}-${option.style}`}
            className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
              selectedGender === option.gender && selectedStyle === option.style
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => {
              onGenderChange(option.gender);
              onStyleChange(option.style);
            }}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <img
                  src={`/avatars/${option.gender}-${option.style}/neutral.webp`}
                  alt={option.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${option.gender}-${option.style}&backgroundColor=f0f0f0`;
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
    </div>
  );
};