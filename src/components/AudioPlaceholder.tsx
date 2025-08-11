import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

interface AudioPlaceholderProps {
  src?: string;
  label?: string;
}

export const AudioPlaceholder = ({ src, label = "Audio coming soon" }: AudioPlaceholderProps) => {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Volume2 className="size-4"/>
        {label}
      </div>
      <Button variant="secondary" size="sm" disabled aria-disabled>
        Play
      </Button>
    </div>
  );
};
