import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressStreak } from "@/components/ProgressStreak";
import { Link } from "react-router-dom";

const Learn = () => (
  <main className="container mx-auto py-10">
    <Seo title="Learn – Modules & streak" description="Beginner, Intermediate, Advanced modules and last visited." canonical="/learn" />
    <h1 className="text-3xl font-bold mb-4">Learn</h1>
    <div className="flex items-center justify-between mb-6">
      <p className="text-muted-foreground">Your modules</p>
      <ProgressStreak days={5} />
    </div>
    <div className="grid md:grid-cols-3 gap-4">
      {["Beginner","Intermediate","Advanced"].map((m) => (
        <Card key={m}><CardContent className="p-6"><h3 className="font-semibold">{m}</h3><p className="text-sm text-muted-foreground">Start {m.toLowerCase()} lessons</p></CardContent></Card>
      ))}
    </div>
    <div className="mt-8">
      <h3 className="font-semibold mb-2">Last visited</h3>
      <Link to="/learn/lessons/greetings" className="underline">Greetings</Link>
    </div>
  </main>
);

export default Learn;
