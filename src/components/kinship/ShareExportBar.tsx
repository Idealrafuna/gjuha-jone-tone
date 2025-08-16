import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, Share2, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { generatePublicSlug } from "@/lib/kinship";

interface ShareExportBarProps {
  isPublic: boolean;
  onTogglePublic: (isPublic: boolean) => void;
  publicSlug?: string;
  onUpdateSlug: (slug: string) => void;
}

export function ShareExportBar({ 
  isPublic, 
  onTogglePublic, 
  publicSlug,
  onUpdateSlug 
}: ShareExportBarProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportImage = async () => {
    setIsExporting(true);
    try {
      const canvas = document.querySelector('.react-flow');
      if (!canvas) {
        throw new Error('Canvas not found');
      }

      const canvasElement = await html2canvas(canvas as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      });

      // Create download link
      const link = document.createElement('a');
      link.download = 'family-tree.png';
      link.href = canvasElement.toDataURL();
      link.click();

      toast.success('Family tree exported successfully!');
    } catch (error) {
      toast.error('Failed to export family tree');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleTogglePublic = (checked: boolean) => {
    if (checked && !publicSlug) {
      const newSlug = generatePublicSlug();
      onUpdateSlug(newSlug);
    }
    onTogglePublic(checked);
  };

  const handleCopyLink = () => {
    if (publicSlug) {
      const link = `${window.location.origin}/kinship/${publicSlug}`;
      navigator.clipboard.writeText(link);
      toast.success('Public link copied to clipboard!');
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Label htmlFor="public-toggle" className="text-sm font-medium">
            Privacy Settings
          </Label>
          <div className="flex items-center space-x-2">
            {isPublic ? (
              <Eye className="w-4 h-4 text-green-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            )}
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={handleTogglePublic}
            />
            <span className="text-sm text-muted-foreground">
              {isPublic ? 'Public' : 'Private'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          onClick={handleExportImage}
          disabled={isExporting}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export as Image'}
        </Button>

        {isPublic && publicSlug && (
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Public Link
          </Button>
        )}
      </div>

      {isPublic && (
        <div className="text-xs text-muted-foreground p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
          <p className="font-medium mb-1">⚠️ Public Tree Notice:</p>
          <p>Your family tree is visible to anyone with the link. Names of minors will show as initials only for privacy.</p>
        </div>
      )}
    </Card>
  );
}