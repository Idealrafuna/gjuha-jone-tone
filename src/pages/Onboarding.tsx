import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import AvatarGuide, { AvatarSelector } from "@/components/AvatarGuide";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

type AvatarKey = "northern-man" | "northern-woman" | "southern-man" | "southern-woman";

const regions = [
  { id: "kosova", label: "Kosova", suggest: "gheg" },
  { id: "northern-albania", label: "Northern Albania", suggest: "gheg" },
  { id: "macedonia", label: "Macedonia", suggest: "gheg" },
  { id: "southern-albania", label: "Southern Albania", suggest: "tosk" },
  { id: "diaspora", label: "Diaspora", suggest: null },
] as const;

type Region = typeof regions[number]["id"];
type Dialect = "gheg" | "tosk";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState("");
  const [region, setRegion] = useState<Region | null>(null);
  const [dialect, setDialect] = useState<Dialect>("gheg");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarKey>("northern-woman");

  // Load saved progress
  useEffect(() => {
    const savedName = localStorage.getItem("userName") || "";
    const savedRegion = localStorage.getItem("userRegion") as Region | null;
    const savedDialect = localStorage.getItem("userDialect") as Dialect | null;
    const savedAvatar = localStorage.getItem("avatarKey") as AvatarKey | null;
    
    if (savedName) setName(savedName);
    if (savedRegion) setRegion(savedRegion);
    if (savedDialect) setDialect(savedDialect);
    if (savedAvatar) setSelectedAvatar(savedAvatar);
  }, []);

  // Auto-suggest dialect based on region
  useEffect(() => {
    if (region) {
      const regionData = regions.find((r) => r.id === region);
      if (regionData?.suggest) {
        setDialect(regionData.suggest as Dialect);
        // Auto-suggest avatar based on dialect
        if (regionData.suggest === "gheg") {
          setSelectedAvatar("northern-woman");
        } else {
          setSelectedAvatar("southern-woman");
        }
      }
    }
  }, [region]);

  const canNext = () => {
    switch (step) {
      case 1: return name.trim().length >= 2;
      case 2: return !!region;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    // Save progress
    if (step === 1) localStorage.setItem("userName", name.trim());
    if (step === 2 && region) localStorage.setItem("userRegion", region);
    if (step === 3) localStorage.setItem("userDialect", dialect);
    
    if (step < 4) {
      setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleFinish = () => {
    localStorage.setItem("avatarKey", selectedAvatar);
    localStorage.setItem("onboardingDone", "true");
    navigate("/");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canNext()) {
      if (step === 4) {
        handleFinish();
      } else {
        handleNext();
      }
    } else if (e.key === "Escape" && step > 1) {
      handleBack();
    }
  };

  const progressValue = (step / 4) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 to-rose-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Seo title="Welcome to BeAlbanian" description="Set up your Albanian learning journey" canonical="/onboarding" />
      
      <Card className="w-full max-w-2xl rounded-2xl shadow-xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to BeAlbanian</h1>
            <p className="text-muted-foreground">Let's set up your learning journey</p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Step {step} of 4</span>
              <span className="text-sm text-muted-foreground">{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="min-h-[400px] flex flex-col justify-between" onKeyDown={handleKeyDown}>
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-4">What's your name?</h2>
                  <p className="text-muted-foreground mb-6">We'll use this to personalize your experience</p>
                </div>
                <div className="max-w-md mx-auto">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Arben"
                    className="text-center text-lg h-12"
                    autoFocus
                  />
                  {name.trim().length > 0 && name.trim().length < 2 && (
                    <p className="text-sm text-destructive mt-2 text-center">Name must be at least 2 characters</p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-4">Where are you from?</h2>
                  <p className="text-muted-foreground mb-6">This helps us suggest the right dialect</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
                  {regions.map((r) => (
                    <button
                      key={r.id}
                      className={`p-4 rounded-xl border-2 text-left transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        region === r.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setRegion(r.id)}
                    >
                      <div className="font-medium">{r.label}</div>
                      {r.suggest && (
                        <div className="text-sm text-muted-foreground">Suggests {r.suggest === "gheg" ? "Gegë" : "Toskë"}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-4">Choose your dialect</h2>
                  <p className="text-muted-foreground mb-6">We've suggested one based on your region</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                  <button
                    className={`p-6 rounded-xl border-2 text-center transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      dialect === "gheg" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setDialect("gheg")}
                  >
                    <div className="text-xl font-semibold mb-2">Gegë</div>
                    <div className="text-sm text-muted-foreground">Northern Albanian dialect</div>
                  </button>
                  <button
                    className={`p-6 rounded-xl border-2 text-center transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      dialect === "tosk" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setDialect("tosk")}
                  >
                    <div className="text-xl font-semibold mb-2">Toskë</div>
                    <div className="text-sm text-muted-foreground">Southern Albanian dialect</div>
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <AvatarSelector 
                  selectedAvatar={selectedAvatar}
                  onAvatarChange={setSelectedAvatar}
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              {step < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canNext()}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinish}
                  className="flex items-center gap-2"
                >
                  Finish
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;