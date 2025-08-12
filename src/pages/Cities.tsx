import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Cities = () => {
  const [cities, setCities] = useState<Array<{ id: string; slug: string; name: string; summary: string; image_url: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Log which Supabase host we're using
    const url = (supabase as any).supabaseUrl || (supabase as any).url || "";
    try {
      const host = url ? new URL(url).host : "unknown";
      console.info("Using Supabase:", host);
    } catch {
      console.info("Using Supabase:", "unknown");
    }

    const fetchCities = async () => {
      const client = supabase as any; // temporary type bypass until Supabase types are synced
      const { data, error } = await client
        .from('cities')
        .select('id, slug, name, summary, image_url')
        .eq('published', true)
        .order('name', { ascending: true });

      if (error) setError(error.message);
      else setCities(data || []);
      setLoading(false);
    };
    fetchCities();
  }, []);

  return (
    <main className="container mx-auto py-10">
      <Seo title="Cities – Learn Albanian Culture" description="Published Albanian cities with summaries and images." canonical="/cities" />
      <h1 className="text-3xl font-bold mb-4">Cities</h1>

      {loading && (
        <p className="text-sm text-muted-foreground">Loading...</p>
      )}

      {error && (
        <p className="text-sm text-destructive">Error: {error}</p>
      )}

      {!loading && !error && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c) => (
            <Link key={c.slug} to={`/cities/${c.slug}`} className="block">
              <Card>
                <CardContent className="p-0">
                  <img
                    src={c.image_url || '/placeholder.svg'}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                    alt={`${c.name} city image`}
                    loading="lazy"
                    className="w-full h-44 object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    <h3 className="font-semibold mb-2">{c.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{c.summary}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
};

export default Cities;
