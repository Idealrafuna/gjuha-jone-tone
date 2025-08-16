import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, X } from "lucide-react";
import { KinshipRelative } from "@/hooks/useFamilyTree";
import { uploadFamilyPhoto, deleteFamilyPhoto } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface RelativeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (relative: Omit<KinshipRelative, 'id' | 'user_id' | 'created_at'>) => void;
  relative?: KinshipRelative;
  isLoading?: boolean;
}

export function RelativeForm({ isOpen, onClose, onSave, relative, isLoading }: RelativeFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: relative?.full_name || '',
    birth_year: relative?.birth_year || '',
    death_year: relative?.death_year || '',
    notes: relative?.notes || '',
    photo_path: relative?.photo_path || ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = async () => {
    if (formData.photo_path) {
      await deleteFamilyPhoto(formData.photo_path);
    }
    setFormData(prev => ({ ...prev, photo_path: '' }));
    setPhotoFile(null);
    setPhotoPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let photoPath = formData.photo_path;

    // Upload new photo if selected
    if (photoFile) {
      setUploadingPhoto(true);
      const tempId = relative?.id || 'temp-' + Date.now();
      const result = await uploadFamilyPhoto(photoFile, user.id, tempId);
      
      if (result.error) {
        toast.error('Failed to upload photo');
        setUploadingPhoto(false);
        return;
      }
      
      photoPath = result.path || '';
      setUploadingPhoto(false);

      // Award XP for uploading photo
      if (typeof window !== 'undefined' && (window as any).onAwardXP && result.path) {
        (window as any).onAwardXP(10, 'Added family photo');
      }
    }

    onSave({
      full_name: formData.full_name,
      birth_year: formData.birth_year ? parseInt(formData.birth_year.toString()) : undefined,
      death_year: formData.death_year ? parseInt(formData.death_year.toString()) : undefined,
      notes: formData.notes || undefined,
      photo_path: photoPath || undefined
    });

    onClose();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {relative ? 'Edit Relative' : 'Add New Relative'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Section */}
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="w-20 h-20">
              <AvatarImage src={photoPreview || formData.photo_path} />
              <AvatarFallback className="text-lg">
                {formData.full_name ? getInitials(formData.full_name) : <Camera className="w-8 h-8" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('photo-upload')?.click()}
                disabled={uploadingPhoto}
              >
                <Upload className="w-4 h-4 mr-1" />
                {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
              </Button>
              
              {(photoPreview || formData.photo_path) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removePhoto}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Birth and Death Years */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birth_year">Birth Year</Label>
              <Input
                id="birth_year"
                type="number"
                value={formData.birth_year}
                onChange={(e) => setFormData(prev => ({ ...prev, birth_year: e.target.value }))}
                placeholder="1950"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="death_year">Death Year</Label>
              <Input
                id="death_year"
                type="number"
                value={formData.death_year}
                onChange={(e) => setFormData(prev => ({ ...prev, death_year: e.target.value }))}
                placeholder="2020"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any special notes or memories..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={!formData.full_name.trim() || isLoading || uploadingPhoto}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}