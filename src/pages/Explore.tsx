import { Seo } from "@/components/Seo";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import DataDebug from "@/components/dev/DataDebug";

const Explore = () => (
  <main className="container mx-auto py-10">
    <Seo title="Explore – Search Albanian content" description="Search lessons, cities, figures, and traditions." canonical="/explore" />
    <h1 className="text-3xl font-bold mb-4">Explore</h1>
    <Input placeholder="Search lessons, cities, figures, traditions..." />
    <div className="grid md:grid-cols-3 gap-4 mt-6">
      <Card><CardContent className="p-6">Sample result: Lesson – Greetings</CardContent></Card>
      <Card><CardContent className="p-6">Sample result: City – Prizren</CardContent></Card>
      <Card><CardContent className="p-6">Sample result: Figure – Skanderbeg</CardContent></Card>
    </div>

    <div className="mt-8">
      <Collapsible>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Debug</h2>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm">Toggle</Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <DataDebug />
        </CollapsibleContent>
      </Collapsible>
    </div>
  </main>
);

export default Explore;
