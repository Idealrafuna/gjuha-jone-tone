import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";

const CultureTraditions = () => (
  <main className="container mx-auto py-10">
    <Seo title="Traditions – Albanian culture" description="Traditions like Besa, weddings, dances, holidays." canonical="/culture/traditions" />
    <h1 className="text-3xl font-bold mb-4">Traditions</h1>
    <div className="grid md:grid-cols-3 gap-4">
      {["Besa","Valle","Dita e Flamurit"].map((t) => (
        <a key={t} href={`/culture/traditions/${t.toLowerCase().replace(/\s/g,'-')}`} className="block">
          <Card><CardContent className="p-6"><h3 className="font-semibold">{t}</h3>
          <p className="text-sm text-muted-foreground">Summary...</p></CardContent></Card>
        </a>
      ))}
    </div>
  </main>
);

export default CultureTraditions;
