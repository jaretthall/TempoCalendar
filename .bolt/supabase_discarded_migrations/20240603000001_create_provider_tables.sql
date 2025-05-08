-- Create providers table
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clinic_types table
CREATE TABLE IF NOT EXISTS clinic_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  clinic_type_id UUID NOT NULL REFERENCES clinic_types(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_vacation BOOLEAN DEFAULT false,
  notes TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE providers;
ALTER PUBLICATION supabase_realtime ADD TABLE clinic_types;
ALTER PUBLICATION supabase_realtime ADD TABLE shifts;

-- Insert sample data for providers
INSERT INTO providers (id, name, color, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Bibiana Patrick', '#8BC34A', true),
  ('00000000-0000-0000-0000-000000000002', 'Joy Ferro', '#FF9800', true),
  ('00000000-0000-0000-0000-000000000003', 'Julia Friederich', '#E91E63', true),
  ('00000000-0000-0000-0000-000000000004', 'John Pound', '#607D8B', true),
  ('00000000-0000-0000-0000-000000000005', 'Jim Knox', '#9E9D24', true),
  ('00000000-0000-0000-0000-000000000006', 'Ludjelie Manigat', '#673AB7', true),
  ('00000000-0000-0000-0000-000000000007', 'Tiffany Good', '#00BCD4', true),
  ('00000000-0000-0000-0000-000000000008', 'Elizabeth Swaggerty', '#4CAF50', true),
  ('00000000-0000-0000-0000-000000000009', 'Philip Sutherland', '#2196F3', true),
  ('00000000-0000-0000-0000-000000000010', 'Carlos Mondragon', '#795548', true),
  ('00000000-0000-0000-0000-000000000011', 'Olivia Gonzales', '#689F38', true),
  ('00000000-0000-0000-0000-000000000012', 'Heidi Kelly', '#F48FB1', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample data for clinic types
INSERT INTO clinic_types (id, name, color, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Clinica Medicos', '#4CAF50', true),
  ('00000000-0000-0000-0000-000000000002', 'Urgent Care', '#FF9800', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample shifts for the current month
INSERT INTO shifts (provider_id, clinic_type_id, start_date, end_date, is_vacation, notes) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', NOW(), NOW() + INTERVAL '8 hours', false, 'Regular shift at Clinica Medicos'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 8 hours', false, 'Clinica Medicos shift'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 8 hours', false, 'Clinica Medicos shift'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 8 hours', true, 'Vacation day');
