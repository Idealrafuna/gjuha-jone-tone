import { useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";

const CultureFigureDetail = () => {
  const { slug } = useParams();
  return (
    <main className="container mx-auto py-10">
      <Seo title={`Figure – ${slug}`} description="Biography, impact, quotes, and timeline." canonical={`/culture/figures/${slug}`} />
      <h1 className="text-3xl font-bold mb-4">Figure: {slug}</h1>
      <Card><CardContent className="p-6">Bio and impact...</CardContent></Card>
    </main>
  );
};

export default CultureFigureDetail;
