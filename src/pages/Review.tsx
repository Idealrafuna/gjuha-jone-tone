import { Seo } from "@/components/Seo";
import { Flashcard } from "@/components/Flashcard";

const Review = () => (
  <main className="container mx-auto py-10">
    <Seo title="Review – Spaced repetition" description="Your saved words for spaced repetition review." canonical="/learn/review" />
    <h1 className="text-3xl font-bold mb-4">Review</h1>
    <div className="grid md:grid-cols-2 gap-4">
      <Flashcard front="Mirëdita" back="Good day" />
      <Flashcard front="Falënderit" back="Thank you" />
    </div>
  </main>
);

export default Review;
