-- Create providers table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'providers') THEN
    CREATE TABLE providers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#4f46e5',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  END IF;
END $$;

-- Create clinic_types table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'clinic_types') THEN
    CREATE TABLE clinic_types (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#3b82f6',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  END IF;
END $$;

-- Create shifts table if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'shifts') THEN
    CREATE TABLE shifts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      clinic_type_id UUID NOT NULL REFERENCES clinic_types(id) ON DELETE CASCADE,
      start_date TIMESTAMPTZ NOT NULL,
      end_date TIMESTAMPTZ NOT NULL,
      is_vacation BOOLEAN NOT NULL DEFAULT FALSE,
      notes TEXT,
      location TEXT,
      is_recurring BOOLEAN DEFAULT FALSE,
      recurrence_pattern TEXT,
      series_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  END IF;
END $$;

-- Insert sample data for providers
INSERT INTO providers (id, name, color, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Bibiana Patrick', '#8BC34A', true),
  ('00000000-0000-0000-0000-000000000002', 'Joy Ferro', '#FF9800', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample data for clinic types
INSERT INTO clinic_types (id, name, color, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Clinica Medicos', '#4CAF50', true),
  ('00000000-0000-0000-0000-000000000002', 'Urgent Care', '#FF9800', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON providers FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Allow public read access" ON clinic_types FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Allow public read access" ON shifts FOR SELECT TO PUBLIC USING (true);

-- Enable realtime
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'shifts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE shifts;
  END IF;
END $$;