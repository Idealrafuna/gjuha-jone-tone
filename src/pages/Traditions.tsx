import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Traditions = () => {
  const [traditions, setTraditions] = useState<Array<{ slug: string; name: string; theme: string; summary: string; image_url: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTraditions = async () => {
      const client = supabase as any; // temporary type bypass
      const { data, error } = await client
        .from('traditions')
        .select('slug, name, theme, summary, image_url')
        .eq('published', true)
        .order('name', { ascending: true });
      if (error) setError(error.message);
      else setTraditions(data || []);
      setLoading(false);
    };
    fetchTraditions();
  }, []);

  return (
    <main className="container mx-auto py-10">
      <Seo title="Traditions – Albanian culture" description="Albanian traditions, etiquette, and themes." canonical="/traditions" />
      <h1 className="text-3xl font-bold mb-4">Traditions</h1>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-destructive">Error: {error}</p>}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {traditions.map((t) => (
            <Link key={t.slug} to={`/traditions/${t.slug}`} className="block">
              <Card>
                <CardContent className="p-0">
                  <img
                    src={t.image_url || '/placeholder.svg'}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg' }}
                    alt={`${t.name} image`}
                    loading="lazy"
                    className="w-full h-44 object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    <h3 className="font-semibold mb-1">{t.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{t.summary}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
};

export default Traditions;
