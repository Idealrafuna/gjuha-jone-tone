import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";

const CultureFigures = () => (
  <main className="container mx-auto py-10">
    <Seo title="Figures – Albanian culture" description="Historical and modern figures." canonical="/culture/figures" />
    <h1 className="text-3xl font-bold mb-4">Figures</h1>
    <div className="grid md:grid-cols-3 gap-4">
      {["Skanderbeg","Nënë Tereza","Ismail Kadare"].map((n) => (
        <a key={n} href={`/culture/figures/${n.toLowerCase().replace(/\s/g,'-')}`} className="block">
          <Card><CardContent className="p-6"><h3 className="font-semibold">{n}</h3>
          <p className="text-sm text-muted-foreground">Short bio...</p></CardContent></Card>
        </a>
      ))}
    </div>
  </main>
);

export default CultureFigures;
