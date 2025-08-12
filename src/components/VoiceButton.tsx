import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Volume2 } from "lucide-react";
import * as React from "react";

interface VoiceButtonProps {
  ariaLabel?: string;
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ ariaLabel = "Play pronunciation", className }) => {
  const { toast } = useToast();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={ariaLabel}
      className={className}
      onClick={() =>
        toast({
          title: "Audio coming soon",
          description: "Pronunciations will be added soon.",
        })
      }
    >
      <Volume2 className="h-4 w-4" />
    </Button>
  );
};

export default VoiceButton;
