import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DialectToggle, Dialect } from "@/components/DialectToggle";
import { useState } from "react";

const regions = [
  { id: "kosova", label: "Kosova", suggest: "gheg" },
  { id: "n-albania", label: "Northern Albania", suggest: "gheg" },
  { id: "macedonia", label: "Macedonia", suggest: "gheg" },
  { id: "ulqin", label: "Ulqin/Montenegro", suggest: "gheg" },
  { id: "s-albania", label: "Southern Albania", suggest: "tosk" },
  { id: "diaspora", label: "Diaspora", suggest: "tosk" },
] as const;

const Onboarding = () => {
  const [region, setRegion] = useState<typeof regions[number]["id"] | null>(null);
  const suggested = regions.find((r) => r.id === region)?.suggest as Dialect | undefined;
  const [dialect, setDialect] = useState<Dialect>(suggested ?? "tosk");

  return (
    <main className="container mx-auto py-10">
      <Seo title="Onboarding – Choose your dialect" description="Pick region and dialect (Gheg or Tosk)." canonical="/onboarding" />
      <h1 className="text-3xl font-bold mb-4">Onboarding</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Choose your region</h3>
            <div className="grid grid-cols-2 gap-2">
              {regions.map((r) => (
                <button
                  key={r.id}
                  className={`border rounded-md px-3 py-2 text-left ${region === r.id ? "bg-secondary" : "hover:bg-accent"}`}
                  onClick={() => { setRegion(r.id); setDialect(r.suggest as Dialect); }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Dialect preference</h3>
            <DialectToggle value={dialect} onChange={setDialect} />
            <p className="text-sm text-muted-foreground mt-3">Suggested: {suggested ?? "—"}. You can change anytime.</p>
            <Button className="mt-4" variant="hero">Save and continue</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Onboarding;
