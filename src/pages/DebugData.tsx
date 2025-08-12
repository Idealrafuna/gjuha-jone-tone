import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface TablePreview {
  publishedCount: number | null;
  totalCount: number | null;
  rows: Array<{ slug: string; title?: string | null; name?: string | null; published?: boolean | null }>
}

export default function DebugData() {
  const [host, setHost] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<string, TablePreview>>({
    cities: { publishedCount: null, totalCount: null, rows: [] },
    figures: { publishedCount: null, totalCount: null, rows: [] },
    traditions: { publishedCount: null, totalCount: null, rows: [] },
    lessons: { publishedCount: null, totalCount: null, rows: [] },
  });

  useEffect(() => {
    const url = (supabase as any).supabaseUrl || (supabase as any).url || "";
    try {
      setHost(url ? new URL(url).host : "");
      if (url) console.info("Using Supabase:", new URL(url).host);
    } catch {
      setHost("");
      console.info("Using Supabase:", "unknown");
    }

    async function load() {
      setLoading(true);
      const tables = ["cities", "figures", "traditions", "lessons"] as const;

      const next: Record<string, TablePreview> = { ...data };

      await Promise.all(
        tables.map(async (t) => {
          // counts
          const { count: pubCount } = await (supabase as any)
            .from(t)
            .select("*", { count: "exact", head: true })
            .eq("published", true);

          const { count: totalCount } = await (supabase as any)
            .from(t)
            .select("*", { count: "exact", head: true });

          // previews
          let selectCols = t === "lessons" ? "slug, title, published" : "slug, name, published";
          const { data: rows } = await (supabase as any)
            .from(t)
            .select(selectCols)
            .order(t === "lessons" ? "title" : "name", { ascending: true })
            .limit(10);

          next[t] = {
            publishedCount: (pubCount as number | null) ?? null,
            totalCount: (totalCount as number | null) ?? null,
            rows: (rows as any[]) || [],
          };
        })
      );

      setData(next);
      setLoading(false);
    }

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = useMemo(() => (
    [
      { key: "cities", label: "Cities" },
      { key: "figures", label: "Figures" },
      { key: "traditions", label: "Traditions" },
      { key: "lessons", label: "Lessons" },
    ] as const
  ), []);

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-2">Debug Data</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Supabase URL Host: <span className="font-medium">{host || "unknown"}</span>
      </p>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-6">
          {items.map((it) => {
            const info = data[it.key];
            const showWarn = (info?.publishedCount ?? 0) === 0 && (info?.totalCount ?? 0) > 0;
            return (
              <Card key={it.key} className="rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold">{it.label}</h2>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary">Published: {info?.publishedCount ?? "–"}</Badge>
                      <Badge variant="outline">Total: {info?.totalCount ?? "–"}</Badge>
                    </div>
                  </div>

                  {showWarn && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Rows exist but are not published. Set published = true to make them visible.
                    </p>
                  )}

                  <Separator className="my-4" />

                  <ul className="text-sm grid sm:grid-cols-2 gap-2">
                    {(info?.rows || []).map((r, idx) => (
                      <li key={idx} className="flex items-center justify-between rounded-md border px-3 py-2">
                        <span className="truncate mr-2">{r.slug}</span>
                        <span className="truncate text-muted-foreground">
                          {(r.name || r.title) ?? "(no title)"} {typeof r.published === 'boolean' ? (r.published ? "· published" : "· draft") : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
