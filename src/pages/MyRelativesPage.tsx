import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Users, Calendar } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RelativeForm } from "@/components/kinship/RelativeForm";
import { PremiumModal } from "@/components/PremiumModal";
import { useFamilyTree, KinshipRelative } from "@/hooks/useFamilyTree";
import { useAuth } from "@/contexts/AuthContext";
import { getFamilyPhotoUrl } from "@/lib/storage";
import { Seo } from "@/components/Seo";
import { BackButton } from "@/components/BackButton";
import { toast } from "sonner";

export default function MyRelativesPage() {
  const { user } = useAuth();
  const {
    relatives,
    isLoading,
    canAddMore,
    freeLimit,
    addRelative,
    updateRelative,
    deleteRelative,
    isAddingRelative,
    addRelativeError
  } = useFamilyTree();

  const [showRelativeForm, setShowRelativeForm] = useState(false);
  const [editingRelative, setEditingRelative] = useState<KinshipRelative | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  // Load photo URLs
  React.useEffect(() => {
    const loadPhotoUrls = async () => {
      const urls: Record<string, string> = {};
      
      for (const relative of relatives) {
        if (relative.photo_path) {
          const url = await getFamilyPhotoUrl(relative.photo_path);
          if (url) {
            urls[relative.id] = url;
          }
        }
      }
      
      setPhotoUrls(urls);
    };

    if (relatives.length > 0) {
      loadPhotoUrls();
    }
  }, [relatives]);

  // Handle premium modal
  React.useEffect(() => {
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

  const handleDeleteRelative = (relative: KinshipRelative) => {
    deleteRelative(relative.id);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getLifespan = (relative: KinshipRelative) => {
    if (!relative.birth_year) return '';
    return `${relative.birth_year}${relative.death_year ? ` - ${relative.death_year}` : ''}`;
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
              Please sign in to manage your relatives.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Seo 
        title="My Relatives - Kinship Tree"
        description="Manage your family members and their information in your Albanian kinship tree."
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <BackButton fallbackPath="/" />
              <div>
                <h1 className="text-3xl font-bold">My Relatives</h1>
                <p className="text-muted-foreground">Manage your family members</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Controls */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Search</CardTitle>
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

              <Card>
                <CardContent className="p-4">
                  <Button onClick={handleAddRelative} className="w-full mb-3">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Relative
                  </Button>
                  
                  <div className="text-sm text-muted-foreground text-center">
                    {relatives.length} of {canAddMore ? '∞' : freeLimit} relatives
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Relatives List */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your relatives...</p>
                  </CardContent>
                </Card>
              ) : filteredRelatives.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRelatives.map((relative) => (
                    <Card key={relative.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center space-y-3">
                          <Avatar className="w-16 h-16">
                            <AvatarImage 
                              src={photoUrls[relative.id]} 
                              alt={relative.full_name} 
                            />
                            <AvatarFallback className="text-lg">
                              {getInitials(relative.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="text-center space-y-1">
                            <h3 className="font-semibold leading-tight">
                              {relative.full_name}
                            </h3>
                            
                            {getLifespan(relative) && (
                              <div className="flex items-center justify-center text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3 mr-1" />
                                {getLifespan(relative)}
                              </div>
                            )}
                            
                            {relative.notes && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {relative.notes}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex gap-2 w-full">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditRelative(relative)}
                              className="flex-1"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Relative</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {relative.full_name} from your family tree? 
                                    This will also delete all their relationships and cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteRelative(relative)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">
                      {searchTerm ? 'No relatives found' : 'No relatives yet'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm 
                        ? `No relatives match "${searchTerm}"`
                        : 'Start building your family tree by adding your first relative'
                      }
                    </p>
                    {!searchTerm && (
                      <Button onClick={handleAddRelative}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Relative
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

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