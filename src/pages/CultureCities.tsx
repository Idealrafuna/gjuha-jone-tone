import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";

const CultureCities = () => (
  <main className="container mx-auto py-10">
    <Seo title="Cities – Albanian culture" description="Cities list with map and cards." canonical="/culture/cities" />
    <h1 className="text-3xl font-bold mb-4">Cities</h1>
    <div className="grid md:grid-cols-3 gap-4">
      {["Tirana","Shkodër","Prishtina"].map((c) => (
        <a key={c} href={`/culture/cities/${c.toLowerCase()}`} className="block">
          <Card><CardContent className="p-6"><h3 className="font-semibold">{c}</h3>
          <p className="text-sm text-muted-foreground">Brief summary...</p></CardContent></Card>
        </a>
      ))}
    </div>
  </main>
);

export default CultureCities;
