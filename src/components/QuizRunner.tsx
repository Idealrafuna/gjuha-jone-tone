import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type QuizAnswer = { id: string; label: string; is_correct?: boolean };
export type QuizQuestion = {
  id: string;
  type: "mcq" | "truefalse" | "fill";
  prompt: string;
  answers: QuizAnswer[];
  explanation?: string;
};

export const QuizRunner = ({ questions }: { questions: QuizQuestion[] }) => {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);

  const submit = () => {
    let sc = 0;
    questions.forEach((q) => {
      const ans = q.answers.find((a) => a.id === selected[q.id]);
      if (ans?.is_correct) sc += 1;
    });
    setScore(sc);
  };

  return (
    <div className="grid gap-4">
      {questions.map((q, idx) => (
        <Card key={q.id}>
          <CardContent className="p-5">
            <p className="font-medium mb-3">{idx + 1}. {q.prompt}</p>
            <div className="grid gap-2">
              {q.answers.map((a) => (
                <label key={a.id} className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={selected[q.id] === a.id}
                    onChange={() => setSelected((s) => ({ ...s, [q.id]: a.id }))}
                  />
                  <span>{a.label}</span>
                </label>
              ))}
            </div>
            {score !== null && (
              <p className="mt-2 text-sm text-muted-foreground">{q.explanation}</p>
            )}
          </CardContent>
        </Card>
      ))}
      <div className="flex items-center gap-3">
        <Button variant="hero" onClick={submit}>Submit</Button>
        {score !== null && (
          <span className="text-sm">Score: <strong>{score}</strong> / {questions.length}</span>
        )}
      </div>
    </div>
  );
};
