import { Seo } from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const CultureCities = () => {
  const [cities, setCities] = useState<Array<{ id: string; slug: string; name: string; summary: string; image_url: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      <Seo title="Cities – Albanian culture" description="Cities list with map and cards." canonical="/culture/cities" />
      <h1 className="text-3xl font-bold mb-4">Cities</h1>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {error && <p className="text-sm text-destructive">Error: {error}</p>}

      {!loading && !error && (
        <div className="grid md:grid-cols-3 gap-4">
          {cities.map((city) => (
            <Link key={city.id} to={`/culture/cities/${city.slug}`} className="block">
              <Card>
                <CardContent className="p-0">
                  {city.image_url && (
                    <img
                      src={city.image_url}
                      alt={`${city.name} city image`}
                      loading="lazy"
                      className="w-full h-44 object-cover rounded-t-lg"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div className="p-6">
                    <h3 className="font-semibold mb-2">{city.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{city.summary}</p>
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

export default CultureCities;

