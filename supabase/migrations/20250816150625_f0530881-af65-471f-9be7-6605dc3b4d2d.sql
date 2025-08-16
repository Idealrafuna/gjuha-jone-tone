-- Create kinship_relatives table
CREATE TABLE IF NOT EXISTS kinship_relatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  birth_year INTEGER,
  death_year INTEGER,
  notes TEXT,
  photo_path TEXT, -- storage path in bucket 'family-photos'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create kinship_relationships table
CREATE TABLE IF NOT EXISTS kinship_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_relative UUID NOT NULL REFERENCES kinship_relatives(id) ON DELETE CASCADE,
  to_relative UUID NOT NULL REFERENCES kinship_relatives(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL, -- e.g., 'parent', 'sibling', 'spouse', 'child'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create kinship_settings table
CREATE TABLE IF NOT EXISTS kinship_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  dialect TEXT DEFAULT 'tosk', -- 'gheg' | 'tosk'
  public_slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create family-photos storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('family-photos', 'family-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE kinship_relatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE kinship_relationships ENABLE ROW LEVEL SECURITY;  
ALTER TABLE kinship_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for kinship_relatives
CREATE POLICY "owner_read_relatives" ON kinship_relatives 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "owner_write_relatives" ON kinship_relatives 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_update_relatives" ON kinship_relatives 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "owner_delete_relatives" ON kinship_relatives 
FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for kinship_relationships
CREATE POLICY "owner_read_relationships" ON kinship_relationships 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "owner_write_relationships" ON kinship_relationships 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_update_relationships" ON kinship_relationships 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "owner_delete_relationships" ON kinship_relationships 
FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for kinship_settings
CREATE POLICY "owner_read_settings" ON kinship_settings 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "owner_upsert_settings" ON kinship_settings 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner_update_settings" ON kinship_settings 
FOR UPDATE USING (auth.uid() = user_id);

-- Storage policies for family-photos bucket
CREATE POLICY "owner_upload_photos" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'family-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "owner_view_photos" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'family-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "owner_update_photos" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'family-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "owner_delete_photos" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'family-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);