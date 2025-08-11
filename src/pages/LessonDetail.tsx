import { useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import { DialectToggle, Dialect } from "@/components/DialectToggle";
import { useState } from "react";
import { AudioPlaceholder } from "@/components/AudioPlaceholder";
import { Flashcard } from "@/components/Flashcard";
import { QuizRunner } from "@/components/QuizRunner";

const LessonDetail = () => {
  const { slug } = useParams();
  const [dialect, setDialect] = useState<Dialect>("tosk");

  return (
    <main className="container mx-auto py-10">
      <Seo title={`Lesson – ${slug}`} description="Objectives, vocabulary, dialogue, grammar, and quiz." canonical={`/learn/lessons/${slug}`} />
      <h1 className="text-3xl font-bold mb-4">Lesson: {slug}</h1>

      <div className="mb-4"><DialectToggle value={dialect} onChange={setDialect} /></div>

      <section className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Vocabulary</h3>
            <Flashcard front="Përshëndetje (Tosk)" back="Tungjatjeta (Gheg)" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Dialogue</h3>
            <p className="text-sm text-muted-foreground">Side-by-side variants with audio placeholders.</p>
            <AudioPlaceholder label="Hello – Tosk" />
            <div className="h-2" />
            <AudioPlaceholder label="Hello – Gheg" />
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Quick quiz</h3>
            <QuizRunner
              questions={[
                { id: "q1", type: "mcq", prompt: "How do you say Hello in Tosk?", answers: [
                  { id: "a1", label: "Përshëndetje", is_correct: true },
                  { id: "a2", label: "Tungjatjeta" },
                ], explanation: "Tosk: Përshëndetje; Gheg: Tungjatjeta." },
              ]}
            />
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default LessonDetail;
