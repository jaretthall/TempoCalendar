-- Create providers table if it doesn't exist
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#4f46e5',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create clinic_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS clinic_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create shifts table if it doesn't exist
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  clinic_type_id UUID NOT NULL REFERENCES clinic_types(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_vacation BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default providers if none exist
INSERT INTO providers (name, color)
SELECT 'Dr. Smith', '#4f46e5'
WHERE NOT EXISTS (SELECT 1 FROM providers LIMIT 1);

INSERT INTO providers (name, color)
SELECT 'Dr. Johnson', '#10b981'
WHERE NOT EXISTS (SELECT 1 FROM providers WHERE name = 'Dr. Johnson');

INSERT INTO providers (name, color)
SELECT 'Dr. Williams', '#f59e0b'
WHERE NOT EXISTS (SELECT 1 FROM providers WHERE name = 'Dr. Williams');

-- Insert default clinic types if none exist
INSERT INTO clinic_types (name, color)
SELECT 'Primary Care', '#3b82f6'
WHERE NOT EXISTS (SELECT 1 FROM clinic_types LIMIT 1);

INSERT INTO clinic_types (name, color)
SELECT 'Specialty', '#ec4899'
WHERE NOT EXISTS (SELECT 1 FROM clinic_types WHERE name = 'Specialty');

INSERT INTO clinic_types (name, color)
SELECT 'Urgent Care', '#ef4444'
WHERE NOT EXISTS (SELECT 1 FROM clinic_types WHERE name = 'Urgent Care');

-- Enable realtime for tables that aren't already in the publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'providers'
  ) THEN
    alter publication supabase_realtime add table providers;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'clinic_types'
  ) THEN
    alter publication supabase_realtime add table clinic_types;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'shifts'
  ) THEN
    alter publication supabase_realtime add table shifts;
  END IF;
END$$;