import { useEffect, useMemo, useCallback } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  ConnectionMode
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { KinshipRelative, KinshipRelationship } from "@/hooks/useFamilyTree";
import { getFamilyPhotoUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface FamilyTreeCanvasProps {
  relatives: KinshipRelative[];
  relationships: KinshipRelationship[];
  onEditRelative: (relative: KinshipRelative) => void;
  className?: string;
}

interface RelativeNodeData {
  relative: KinshipRelative;
  photoUrl?: string;
  onEdit: (relative: KinshipRelative) => void;
}

// Custom node component for family members
function RelativeNode({ data }: { data: RelativeNodeData }) {
  const { relative, photoUrl, onEdit } = data;
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = relative.full_name.length > 15 
    ? relative.full_name.substring(0, 15) + '...'
    : relative.full_name;

  const lifespan = relative.birth_year 
    ? `${relative.birth_year}${relative.death_year ? ` - ${relative.death_year}` : ''}`
    : '';

  return (
    <div className="relative">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-primary/20 p-3 min-w-[120px] hover:border-primary/40 transition-colors">
        <div className="flex flex-col items-center space-y-2">
          <Avatar className="w-16 h-16 border-2 border-primary/20">
            <AvatarImage src={photoUrl} alt={relative.full_name} />
            <AvatarFallback className="text-sm font-medium">
              {getInitials(relative.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <div className="font-medium text-sm leading-tight" title={relative.full_name}>
              {displayName}
            </div>
            {lifespan && (
              <div className="text-xs text-muted-foreground mt-1">
                {lifespan}
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(relative)}
            className="w-full h-7 text-xs"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  relative: RelativeNode
};

export function FamilyTreeCanvas({ 
  relatives, 
  relationships, 
  onEditRelative, 
  className 
}: FamilyTreeCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Create nodes from relatives
  const createNodes = useCallback(async (): Promise<Node[]> => {
    const nodePromises = relatives.map(async (relative, index) => {
      let photoUrl: string | undefined;
      
      if (relative.photo_path) {
        photoUrl = await getFamilyPhotoUrl(relative.photo_path) || undefined;
      }

      // Simple grid layout for now
      const col = index % 4;
      const row = Math.floor(index / 4);
      
      return {
        id: relative.id,
        type: 'relative',
        position: { 
          x: col * 200 + 50, 
          y: row * 180 + 50 
        },
        data: {
          relative,
          photoUrl,
          onEdit: onEditRelative
        }
      };
    });

    return Promise.all(nodePromises);
  }, [relatives, onEditRelative]);

  // Create edges from relationships
  const createEdges = useMemo((): Edge[] => {
    return relationships.map(relationship => ({
      id: relationship.id,
      source: relationship.from_relative,
      target: relationship.to_relative,
      type: 'smoothstep',
      label: relationship.relation_type,
      labelStyle: { 
        fontSize: 12,
        fontWeight: 500,
        fill: '#666'
      },
      style: { 
        stroke: '#8B5CF6',
        strokeWidth: 2
      }
    }));
  }, [relationships]);

  // Update nodes and edges when data changes
  useEffect(() => {
    createNodes().then(newNodes => {
      setNodes(newNodes);
    });
    setEdges(createEdges);
  }, [createNodes, createEdges, setNodes, setEdges]);

  const minimapNodeColor = (node: Node) => {
    return '#8B5CF6';
  };

  return (
    <div className={cn("w-full h-full border rounded-lg", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
        className="family-tree-canvas"
      >
        <Background />
        <Controls 
          position="top-left"
          showInteractive={false}
        />
        <MiniMap 
          nodeColor={minimapNodeColor}
          position="bottom-right"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}