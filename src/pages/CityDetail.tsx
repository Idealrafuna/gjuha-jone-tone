import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/BackButton";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

const CityDetail = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<any | null>(null);

  useEffect(() => {
    const fetchCity = async () => {
      const client = supabase as any; // types bypass
      const { data, error } = await client
        .from('cities')
        .select('slug, name, country, region, summary, history_markdown, dialect_notes, notable_people, image_url, published')
        .eq('slug', slug)
        .single();
      if (error || !data || !data.published) setError('Not found'); else setCity(data);
      setLoading(false);
    };
    fetchCity();
  }, [slug]);

  if (loading) return <main className="container mx-auto py-10"><p className="text-sm text-muted-foreground">Loading...</p></main>;
  if (error || !city) return <main className="container mx-auto py-10"><p className="text-sm text-muted-foreground">Not found</p></main>;

  return (
    <main className="container mx-auto py-10">
      <Seo title={`City – ${city.name}`} description={city.summary} canonical={`/cities/${city.slug}`} />
      <BackButton fallbackPath="/cities" />
      <div className="w-full max-w-4xl mx-auto mb-6">
        <img
          src={city.image_url || '/placeholder.svg'}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg' }}
          alt={`${city.name} image`}
          loading="lazy"
          className="w-full h-auto object-contain rounded-lg shadow-lg"
        />
      </div>
      <div className="mb-3 flex gap-2">
        <Badge variant="secondary">{city.country}</Badge>
        <Badge variant="secondary">{city.region}</Badge>
      </div>
      <h1 className="text-3xl font-bold mb-2">{city.name}</h1>
      <p className="text-muted-foreground mb-6">{city.summary}</p>

      <section className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>{city.history_markdown}</ReactMarkdown>
      </section>

      {city.dialect_notes && (
        <section className="mt-6">
          <h3 className="font-semibold mb-2">Dialect notes</h3>
          <p className="text-sm text-muted-foreground">{city.dialect_notes}</p>
        </section>
      )}

      {Array.isArray(city.notable_people) && city.notable_people.length > 0 && (
        <section className="mt-6">
          <h3 className="font-semibold mb-2">Notable people</h3>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {city.notable_people.map((p: string) => <li key={p}>{p}</li>)}
          </ul>
        </section>
      )}
    </main>
  );
};

export default CityDetail;
