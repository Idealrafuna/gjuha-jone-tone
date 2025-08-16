import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Users, Search, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FamilyTreeCanvas } from "@/components/kinship/FamilyTreeCanvas";
import { RelativeForm } from "@/components/kinship/RelativeForm";
import { KinshipLegend } from "@/components/kinship/KinshipLegend";
import { ShareExportBar } from "@/components/kinship/ShareExportBar";
import { PremiumModal } from "@/components/PremiumModal";
import { useFamilyTree, KinshipRelative } from "@/hooks/useFamilyTree";
import { useAuth } from "@/contexts/AuthContext";
import { Seo } from "@/components/Seo";
import { BackButton } from "@/components/BackButton";
import { toast } from "sonner";

export default function KinshipTreePage() {
  const { user } = useAuth();
  const {
    relatives,
    relationships,
    settings,
    isLoading,
    canAddMore,
    freeLimit,
    addRelative,
    updateRelative,
    updateSettings,
    isAddingRelative,
    addRelativeError
  } = useFamilyTree();

  const [showRelativeForm, setShowRelativeForm] = useState(false);
  const [editingRelative, setEditingRelative] = useState<KinshipRelative | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Show onboarding for first-time users
  useEffect(() => {
    if (user && relatives.length === 0 && !isLoading) {
      const hasSeenOnboarding = localStorage.getItem('kinship-onboarding-seen');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user, relatives.length, isLoading]);

  // Handle premium modal
  useEffect(() => {
    if (addRelativeError === 'FREE_LIMIT_EXCEEDED') {
      setShowPremiumModal(true);
    }
  }, [addRelativeError]);

  const handleAddRelative = () => {
    if (!canAddMore) {
      setShowPremiumModal(true);
      return;
    }
    setEditingRelative(undefined);
    setShowRelativeForm(true);
  };

  const handleEditRelative = (relative: KinshipRelative) => {
    setEditingRelative(relative);
    setShowRelativeForm(true);
  };

  const handleSaveRelative = (relativeData: Omit<KinshipRelative, 'id' | 'user_id' | 'created_at'>) => {
    if (editingRelative) {
      updateRelative({ id: editingRelative.id, updates: relativeData });
    } else {
      addRelative(relativeData);
    }
    setShowRelativeForm(false);
  };

  const handleDialectChange = (dialect: 'tosk' | 'gheg') => {
    updateSettings({ dialect });
  };

  const handleTogglePublic = (isPublic: boolean) => {
    updateSettings({ is_public: isPublic });
  };

  const handleUpdateSlug = (publicSlug: string) => {
    updateSettings({ public_slug: publicSlug });
  };

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('kinship-onboarding-seen', 'true');
  };

  const filteredRelatives = relatives.filter(relative =>
    relative.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6 text-center">
          <CardContent>
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground">
              Please sign in to create and manage your family tree.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Seo 
        title="Kinship Tree - Familja Ime"
        description="Create a visual family tree with Albanian kinship terms. Add photos, track relationships, and preserve your family history."
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <BackButton fallbackPath="/" />
              <div>
                <h1 className="text-3xl font-bold">Kinship Tree</h1>
                <p className="text-muted-foreground">Create your family tree with Albanian kinship terms</p>
              </div>
            </div>

            {/* How to Play */}
            <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">How to Use Your Family Tree:</h3>
                <p className="text-sm text-muted-foreground">
                  Add yourself first, then expand by adding gjyshi/gjyshja, parents, and other relatives. 
                  Use Albanian kinship terms and add photos to make your tree come alive! 
                  Switch between Gheg and Tosk dialects to learn regional differences.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Panel - Controls */}
            <div className="lg:col-span-1 space-y-4">
              {/* Search */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Search Family</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search relatives..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Add Relative */}
              <Card>
                <CardContent className="p-4">
                  <Button onClick={handleAddRelative} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Relative
                  </Button>
                  
                  {!canAddMore && (
                    <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded text-xs text-amber-800 dark:text-amber-200">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      Free limit: {relatives.length}/{freeLimit}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Privacy & Export */}
              <ShareExportBar
                isPublic={settings?.is_public || false}
                onTogglePublic={handleTogglePublic}
                publicSlug={settings?.public_slug}
                onUpdateSlug={handleUpdateSlug}
              />
            </div>

            {/* Center - Family Tree Canvas */}
            <div className="lg:col-span-2">
              {relatives.length > 0 ? (
                <FamilyTreeCanvas
                  relatives={filteredRelatives}
                  relationships={relationships}
                  onEditRelative={handleEditRelative}
                  className="h-[600px]"
                />
              ) : (
                <Card className="h-[600px] flex items-center justify-center">
                  <CardContent className="text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Start Your Family Tree</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your first family member to begin building your tree
                    </p>
                    <Button onClick={handleAddRelative}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Relative
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Panel - Legend */}
            <div className="lg:col-span-1">
              <KinshipLegend
                dialect={settings?.dialect || 'tosk'}
                onDialectChange={handleDialectChange}
              />
            </div>
          </div>
        </div>

        {/* Onboarding Modal */}
        <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Welcome to Your Family Tree! 👪</DialogTitle>
              <DialogDescription className="space-y-3">
                <p>Build your family history with Albanian kinship terms:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Start by adding yourself</li>
                  <li>Add gjyshi/gjyshja (grandparents)</li>
                  <li>Include parents, siblings, and cousins</li>
                  <li>Upload photos to personalize your tree</li>
                  <li>Switch between Gheg and Tosk dialects</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Your tree is private by default. You can make it public later to share with family.
                </p>
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
              <Button variant="outline" onClick={dismissOnboarding} className="flex-1">
                Got It
              </Button>
              <Button onClick={() => { dismissOnboarding(); handleAddRelative(); }} className="flex-1">
                Add First Person
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Relative Form */}
        <RelativeForm
          isOpen={showRelativeForm}
          onClose={() => setShowRelativeForm(false)}
          onSave={handleSaveRelative}
          relative={editingRelative}
          isLoading={isAddingRelative}
        />

        {/* Premium Modal */}
        <PremiumModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          feature="unlimited family members"
        />
      </div>
    </>
  );
}