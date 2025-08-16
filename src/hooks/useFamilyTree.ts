import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessControl } from "@/hooks/useAccessControl";
import { toast } from "sonner";

export interface KinshipRelative {
  id: string;
  user_id: string;
  full_name: string;
  birth_year?: number;
  death_year?: number;
  notes?: string;
  photo_path?: string;
  created_at: string;
}

export interface KinshipRelationship {
  id: string;
  user_id: string;
  from_relative: string;
  to_relative: string;
  relation_type: string;
  created_at: string;
}

export interface KinshipSettings {
  user_id: string;
  is_public: boolean;
  dialect: 'tosk' | 'gheg';
  public_slug?: string;
  created_at: string;
}

const FREE_RELATIVES_LIMIT = 6;

export function useFamilyTree() {
  const { user } = useAuth();
  const { isPremium } = useAccessControl();
  const queryClient = useQueryClient();

  // Fetch relatives
  const {
    data: relatives = [],
    isLoading: relativesLoading,
    error: relativesError
  } = useQuery({
    queryKey: ['kinship-relatives', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('kinship_relatives')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as KinshipRelative[];
    },
    enabled: !!user
  });

  // Fetch relationships
  const {
    data: relationships = [],
    isLoading: relationshipsLoading
  } = useQuery({
    queryKey: ['kinship-relationships', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('kinship_relationships')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as KinshipRelationship[];
    },
    enabled: !!user
  });

  // Fetch settings
  const {
    data: settings,
    isLoading: settingsLoading
  } = useQuery({
    queryKey: ['kinship-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('kinship_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as KinshipSettings | null;
    },
    enabled: !!user
  });

  // Add relative mutation
  const addRelativeMutation = useMutation({
    mutationFn: async (newRelative: Omit<KinshipRelative, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('User not authenticated');
      
      // Check free tier limits
      if (!isPremium && relatives.length >= FREE_RELATIVES_LIMIT) {
        throw new Error('FREE_LIMIT_EXCEEDED');
      }

      const { data, error } = await supabase
        .from('kinship_relatives')
        .insert([{ ...newRelative, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['kinship-relatives', user?.id] });
      toast.success(`Added ${data.full_name} to your family tree!`);
      
      // Award XP for adding relative
      if (typeof window !== 'undefined' && (window as any).onAwardXP) {
        (window as any).onAwardXP(15, 'Added family member');
      }
    },
    onError: (error: Error) => {
      if (error.message === 'FREE_LIMIT_EXCEEDED') {
        return; // Will be handled by calling component with PremiumModal
      }
      toast.error('Failed to add relative');
    }
  });

  // Update relative mutation
  const updateRelativeMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<KinshipRelative> }) => {
      const { data, error } = await supabase
        .from('kinship_relatives')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kinship-relatives', user?.id] });
      toast.success('Relative updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update relative');
    }
  });

  // Delete relative mutation
  const deleteRelativeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('kinship_relatives')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kinship-relatives', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['kinship-relationships', user?.id] });
      toast.success('Relative removed from family tree');
    },
    onError: () => {
      toast.error('Failed to remove relative');
    }
  });

  // Add relationship mutation
  const addRelationshipMutation = useMutation({
    mutationFn: async (newRelationship: Omit<KinshipRelationship, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('kinship_relationships')
        .insert([{ ...newRelationship, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kinship-relationships', user?.id] });
      toast.success('Relationship added!');
    },
    onError: () => {
      toast.error('Failed to add relationship');
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<KinshipSettings>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('kinship_settings')
        .upsert([{ user_id: user.id, ...updates }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kinship-settings', user?.id] });
      toast.success('Settings updated!');
    },
    onError: () => {
      toast.error('Failed to update settings');
    }
  });

  const canAddMore = isPremium || relatives.length < FREE_RELATIVES_LIMIT;

  return {
    relatives,
    relationships,
    settings,
    isLoading: relativesLoading || relationshipsLoading || settingsLoading,
    canAddMore,
    freeLimit: FREE_RELATIVES_LIMIT,
    addRelative: addRelativeMutation.mutate,
    updateRelative: updateRelativeMutation.mutate,
    deleteRelative: deleteRelativeMutation.mutate,
    addRelationship: addRelationshipMutation.mutate,
    updateSettings: updateSettingsMutation.mutate,
    isAddingRelative: addRelativeMutation.isPending,
    addRelativeError: addRelativeMutation.error?.message === 'FREE_LIMIT_EXCEEDED' ? 'FREE_LIMIT_EXCEEDED' : null
  };
}