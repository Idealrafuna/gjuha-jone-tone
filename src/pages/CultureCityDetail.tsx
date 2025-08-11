import { useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";

const CultureCityDetail = () => {
  const { slug } = useParams();
  return (
    <main className="container mx-auto py-10">
      <Seo title={`City – ${slug}`} description="Facts, history, dialect notes, notable people, and quiz." canonical={`/culture/cities/${slug}`} />
      <h1 className="text-3xl font-bold mb-4">City: {slug}</h1>
      <Card><CardContent className="p-6">History and dialect notes...</CardContent></Card>
    </main>
  );
};

export default CultureCityDetail;
