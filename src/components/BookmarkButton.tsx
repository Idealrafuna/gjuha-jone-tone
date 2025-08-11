import { useState } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export const BookmarkButton = ({ initial = false }: { initial?: boolean }) => {
  const [saved, setSaved] = useState(initial);
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm transition-colors",
        saved ? "bg-secondary" : "hover:bg-accent"
      )}
      onClick={() => {
        setSaved((s) => !s);
        toast({ title: saved ? "Removed" : "Saved", description: "Bookmark updated" });
      }}
      aria-pressed={saved}
    >
      <Bookmark className="size-4"/>
      {saved ? "Saved" : "Save"}
    </button>
  );
};
