import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Figures = () => {
  const [figures, setFigures] = useState<Array<{ slug: string; name: string; era: string; field: string; image_url: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFigures = async () => {
      const client = supabase as any; // temporary type bypass
      const { data, error } = await client
        .from('figures')
        .select('slug, name, era, field, image_url')
        .eq('published', true)
        .order('name', { ascending: true });
      if (error) setError(error.message);
      else setFigures(data || []);
      setLoading(false);
    };
    fetchFigures();
  }, []);

  return (
    <main className="container mx-auto py-10">
      <Seo title="Figures – Albanian culture" description="Historical and modern Albanian figures." canonical="/figures" />
      <h1 className="text-3xl font-bold mb-4">Figures</h1>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-destructive">Error: {error}</p>}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {figures.map((f) => (
            <Link key={f.slug} to={`/figures/${f.slug}`} className="block">
              <Card>
                <CardContent className="p-0">
                  <img
                    src={f.image_url || '/placeholder.svg'}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg' }}
                    alt={`${f.name} image`}
                    loading="lazy"
                    className="w-full h-44 object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    <div className="mb-2 flex gap-2">
                      <Badge variant="secondary">{f.era}</Badge>
                      <Badge variant="secondary">{f.field}</Badge>
                    </div>
                    <h3 className="font-semibold">{f.name}</h3>
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

export default Figures;
