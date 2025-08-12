import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Volume2 } from "lucide-react";

export default function VoiceButton() {
  const { toast } = useToast();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Play pronunciation"
      className="rounded-full border"
      onClick={() =>
        toast({
          title: "Audio coming soon",
          description: "Pronunciations will be added soon.",
        })
      }
    >
      <Volume2 className="h-5 w-5" />
    </Button>
  );
}
