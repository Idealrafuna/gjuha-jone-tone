import { useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";

const CultureTraditionDetail = () => {
  const { slug } = useParams();
  return (
    <main className="container mx-auto py-10">
      <Seo title={`Tradition – ${slug}`} description="Details, gallery placeholders, and mini-quiz." canonical={`/culture/traditions/${slug}`} />
      <h1 className="text-3xl font-bold mb-4">Tradition: {slug}</h1>
      <Card><CardContent className="p-6">Details and etiquette...</CardContent></Card>
    </main>
  );
};

export default CultureTraditionDetail;
