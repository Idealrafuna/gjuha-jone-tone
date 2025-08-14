import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DialectToggle, Dialect } from "@/components/DialectToggle";
import { AvatarSelector, AvatarGuide } from "@/components/AvatarGuide";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const regions = [
  { id: "kosova", label: "Kosova", suggest: "gheg" },
  { id: "n-albania", label: "Northern Albania", suggest: "gheg" },
  { id: "macedonia", label: "Macedonia", suggest: "gheg" },
  { id: "ulqin", label: "Ulqin/Montenegro", suggest: "gheg" },
  { id: "s-albania", label: "Southern Albania", suggest: "tosk" },
  { id: "diaspora", label: "Diaspora", suggest: "tosk" },
] as const;

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [name, setName] = useState("");
  const [region, setRegion] = useState<typeof regions[number]["id"] | null>(null);
  const suggested = regions.find((r) => r.id === region)?.suggest as Dialect | undefined;
  const [dialect, setDialect] = useState<Dialect>(suggested ?? "tosk");
  const [avatarGender, setAvatarGender] = useState<"male" | "female">("female");
  const [avatarStyle, setAvatarStyle] = useState<"gheg" | "tosk">("gheg");

  useEffect(() => {
    if (region && suggested && dialect !== suggested) {
      // keep user choice; no auto-change once picked
    }
  }, [region, suggested, dialect]);

  const canNext = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return !!region;
    if (step === 2) return true;
    return true;
  };

  const handleSave = () => {
    localStorage.setItem("userName", name.trim());
    if (region) localStorage.setItem("userRegion", region);
    localStorage.setItem("userDialect", dialect);
    localStorage.setItem("avatarGender", avatarGender);
    localStorage.setItem("avatarStyle", avatarStyle);
    localStorage.setItem("onboarded", "true");
    navigate("/");
  };

  return (
    <main className="container mx-auto py-10">
      <Seo title="Onboarding – Choose your dialect" description="Pick name, region, and dialect (Gheg or Tosk)." canonical="/onboarding" />
      <h1 className="text-3xl font-bold mb-4">Welcome to BeAlbanian</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">{step === 0 ? "Your name" : step === 1 ? "Choose your region" : step === 2 ? "Dialect preference" : "Choose your guide"}</h3>
            {step === 0 && (
              <div className="grid gap-2">
                <label className="text-sm text-muted-foreground" htmlFor="name">What should we call you?</label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Arben" />
              </div>
            )}
            {step === 1 && (
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
            )}
            {step === 2 && (
              <div>
                <DialectToggle value={dialect} onChange={setDialect} />
                <p className="text-sm text-muted-foreground mt-3">Suggested: {suggested ?? "—"}. You can change anytime.</p>
              </div>
            )}
            {step === 3 && (
              <div>
                <AvatarSelector 
                  selectedGender={avatarGender}
                  selectedStyle={avatarStyle}
                  onGenderChange={setAvatarGender}
                  onStyleChange={setAvatarStyle}
                />
                <p className="text-sm text-muted-foreground mt-3">Your guide will help you learn and celebrate Albanian culture!</p>
              </div>
            )}
            <div className="mt-6 flex items-center gap-2">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep((s) => (s - 1) as 0 | 1 | 2 | 3)}>Back</Button>
              )}
              {step < 3 && (
                <Button variant="hero" disabled={!canNext()} onClick={() => setStep((s) => (s + 1) as 0 | 1 | 2 | 3)}>Next</Button>
              )}
              {step === 3 && (
                <Button className="mt-0" variant="hero" onClick={handleSave}>Save and continue</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Progress</h3>
            <ol className="text-sm text-muted-foreground list-decimal pl-5">
              <li className={step >= 0 ? "text-foreground" : ""}>Name</li>
              <li className={step >= 1 ? "text-foreground" : ""}>Region</li>
              <li className={step >= 2 ? "text-foreground" : ""}>Dialect</li>
              <li className={step >= 3 ? "text-foreground" : ""}>Guide</li>
            </ol>
            {step >= 3 && (
              <div className="mt-4 flex justify-center">
                <AvatarGuide 
                  emotion="encouraging" 
                  size="sm"
                  showSpeechBubble={true}
                  speechText="Mirë se vini! Let's learn together!"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Onboarding;
