import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialectToggle, type Dialect } from "@/components/DialectToggle";
import { KINSHIP_LABELS } from "@/lib/kinship";

interface KinshipLegendProps {
  dialect: Dialect;
  onDialectChange: (dialect: Dialect) => void;
}

export function KinshipLegend({ dialect, onDialectChange }: KinshipLegendProps) {
  const labels = KINSHIP_LABELS[dialect];

  return (
    <Card className="w-full h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Kinship Terms</CardTitle>
        <DialectToggle value={dialect} onChange={onDialectChange} />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="space-y-1">
            <h4 className="font-medium text-muted-foreground">Grandparents</h4>
            <div className="ml-2 space-y-1">
              <div>{labels.grandfather} - Grandfather</div>
              <div>{labels.grandmother} - Grandmother</div>
            </div>
          </div>
          
          <div className="space-y-1">
            <h4 className="font-medium text-muted-foreground">Parents</h4>
            <div className="ml-2 space-y-1">
              <div>{labels.father} - Father</div>
              <div>{labels.mother} - Mother</div>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="font-medium text-muted-foreground">Siblings</h4>
            <div className="ml-2 space-y-1">
              <div>{labels.brother} - Brother</div>
              <div>{labels.sister} - Sister</div>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="font-medium text-muted-foreground">Uncles & Aunts</h4>
            <div className="ml-2 space-y-1">
              <div>{labels.paternal_uncle} - Uncle (father's side)</div>
              <div>{labels.maternal_uncle} - Uncle (mother's side)</div>
              <div>{labels.paternal_aunt} - Aunt (father's side)</div>
              <div>{labels.maternal_aunt} - Aunt (mother's side)</div>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="font-medium text-muted-foreground">Cousins</h4>
            <div className="ml-2 space-y-1">
              <div>{labels.cousin_male} - Male cousin</div>
              <div>{labels.cousin_female} - Female cousin</div>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="font-medium text-muted-foreground">Children</h4>
            <div className="ml-2 space-y-1">
              <div>{labels.son} - Son</div>
              <div>{labels.daughter} - Daughter</div>
              <div>{labels.nephew} - Nephew</div>
              <div>{labels.niece} - Niece</div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
          <h5 className="font-medium mb-1">Tips:</h5>
          <ul className="space-y-1">
            <li>• Tap any person to edit their details</li>
            <li>• Drag to pan around the tree</li>
            <li>• Pinch or scroll to zoom</li>
            <li>• Add photos for a personal touch</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}