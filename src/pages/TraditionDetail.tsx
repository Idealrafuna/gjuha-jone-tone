import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/BackButton";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

const TraditionDetail = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tradition, setTradition] = useState<any | null>(null);

  useEffect(() => {
    const fetchTradition = async () => {
      const client = supabase as any; // types bypass
      const { data, error } = await client
        .from('traditions')
        .select('slug, name, theme, summary, detail_markdown, etiquette_markdown, image_url, published')
        .eq('slug', slug)
        .single();
      if (error || !data || !data.published) setError('Not found'); else setTradition(data);
      setLoading(false);
    };
    fetchTradition();
  }, [slug]);

  if (loading) return <main className="container mx-auto py-10"><p className="text-sm text-muted-foreground">Loading...</p></main>;
  if (error || !tradition) return <main className="container mx-auto py-10"><p className="text-sm text-muted-foreground">Not found</p></main>;

  return (
    <main className="container mx-auto py-10">
      <Seo title={`Tradition – ${tradition.name}`} description={tradition.summary} canonical={`/traditions/${tradition.slug}`} />
      <BackButton fallbackPath="/traditions" />
      <div className="w-full max-w-4xl mx-auto mb-6">
        <img
          src={tradition.image_url || '/placeholder.svg'}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg' }}
          alt={`${tradition.name} image`}
          loading="lazy"
          className="w-full h-auto object-contain rounded-lg shadow-lg"
        />
      </div>
      <div className="mb-3 flex gap-2">
        <Badge variant="secondary">{tradition.theme}</Badge>
      </div>
      <h1 className="text-3xl font-bold mb-2">{tradition.name}</h1>
      <p className="text-muted-foreground mb-6">{tradition.summary}</p>

      <section className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>{tradition.detail_markdown}</ReactMarkdown>
      </section>

      {tradition.etiquette_markdown && (
        <section className="prose prose-sm dark:prose-invert max-w-none mt-6">
          <h3 className="font-semibold">Etiquette</h3>
          <ReactMarkdown>{tradition.etiquette_markdown}</ReactMarkdown>
        </section>
      )}
    </main>
  );
};

export default TraditionDetail;
