import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function DataDebug() {
  const { toast } = useToast();
  const [counts, setCounts] = useState<{ [k: string]: number | null }>({
    cities: null,
    figures: null,
    traditions: null,
    lessons: null,
  });
  const [clientHost, setClientHost] = useState<string>("");

  useEffect(() => {
    const url = (supabase as any).supabaseUrl || (supabase as any).url || "";
    try {
      setClientHost(url ? new URL(url).host : "");
    } catch {
      setClientHost("");
    }

    async function loadCounts() {
      const tables = ["cities", "figures", "traditions", "lessons"] as const;
      const entries: Array<[string, number | null]> = [];
      for (const t of tables) {
        const { count, error } = await (supabase as any)
          .from(t)
          .select("*", { count: "exact", head: true })
          .eq("published", true);
        entries.push([t, error ? null : (count as number | null)]);
      }
      const next = Object.fromEntries(entries);
      setCounts(next);

      if (Object.values(next).some((c) => c === 0)) {
        toast({
          title: "No published items found",
          description: "Mark items as published in Supabase.",
        });
      }
    }

    loadCounts();
  }, [toast]);

  const rows = useMemo(
    () => [
      { label: "Cities", key: "cities" },
      { label: "Figures", key: "figures" },
      { label: "Traditions", key: "traditions" },
      { label: "Lessons", key: "lessons" },
    ] as const,
    []
  );

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4">
        <div className="text-sm mb-2 text-muted-foreground">
          Supabase URL Host: <span className="font-medium">{clientHost || "unknown"}</span>
        </div>
        <ul className="text-sm grid sm:grid-cols-2 gap-2">
          {rows.map((r) => (
            <li key={r.key} className="flex items-center justify-between rounded-md border px-3 py-2">
              <span>{r.label}</span>
              <span className="font-semibold">{counts[r.key] ?? "–"}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
