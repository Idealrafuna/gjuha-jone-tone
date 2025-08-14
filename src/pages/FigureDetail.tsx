import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/BackButton";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

const FigureDetail = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [figure, setFigure] = useState<any | null>(null);

  useEffect(() => {
    const fetchFigure = async () => {
      const client = supabase as any; // types bypass
      const { data, error } = await client
        .from('figures')
        .select('slug, name, era, field, bio_markdown, impact_markdown, image_url, published')
        .eq('slug', slug)
        .single();
      if (error || !data || !data.published) setError('Not found'); else setFigure(data);
      setLoading(false);
    };
    fetchFigure();
  }, [slug]);

  if (loading) return <main className="container mx-auto py-10"><p className="text-sm text-muted-foreground">Loading...</p></main>;
  if (error || !figure) return <main className="container mx-auto py-10"><p className="text-sm text-muted-foreground">Not found</p></main>;

  return (
    <main className="container mx-auto py-10">
      <Seo title={`Figure – ${figure.name}`} description={`${figure.name} – ${figure.era}, ${figure.field}`} canonical={`/figures/${figure.slug}`} />
      <BackButton fallbackPath="/figures" />
      <div className="w-full max-w-4xl mx-auto mb-6">
        <img
          src={figure.image_url || '/placeholder.svg'}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg' }}
          alt={`${figure.name} image`}
          loading="lazy"
          className="w-full h-auto object-contain rounded-lg shadow-lg"
        />
      </div>
      <div className="mb-3 flex gap-2">
        <Badge variant="secondary">{figure.era}</Badge>
        <Badge variant="secondary">{figure.field}</Badge>
      </div>
      <h1 className="text-3xl font-bold mb-2">{figure.name}</h1>

      <section className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>{figure.bio_markdown}</ReactMarkdown>
      </section>

      <section className="prose prose-sm dark:prose-invert max-w-none mt-6">
        <h3 className="font-semibold">Impact</h3>
        <ReactMarkdown>{figure.impact_markdown}</ReactMarkdown>
      </section>
    </main>
  );
};

export default FigureDetail;
