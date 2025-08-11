import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface FlashcardProps {
  front: string;
  back: string;
  onGrade?: (grade: "again" | "good" | "easy") => void;
}

export const Flashcard = ({ front, back, onGrade }: FlashcardProps) => {
  const [flipped, setFlipped] = useState(false);

  const grade = (g: "again" | "good" | "easy") => {
    onGrade?.(g);
    toast({ title: "Saved", description: `Marked as ${g}` });
    setFlipped(false);
  };

  return (
    <Card className="select-none">
      <CardContent className="p-6">
        <div
          className="h-40 md:h-48 flex items-center justify-center text-xl font-semibold cursor-pointer"
          onClick={() => setFlipped((f) => !f)}
          aria-label="Flip card"
          role="button"
        >
          {flipped ? back : front}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="destructive" onClick={() => grade("again")}>Again</Button>
          <Button variant="secondary" onClick={() => grade("good")}>Good</Button>
          <Button variant="hero" onClick={() => grade("easy")}>Easy</Button>
        </div>
      </CardContent>
    </Card>
  );
};
