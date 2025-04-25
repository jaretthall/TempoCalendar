-- Add recurring shift columns to shifts table
ALTER TABLE shifts 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT,
ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMP WITH TIME ZONE;

-- Enable realtime for updated shifts table (reapply in case it was lost)
ALTER PUBLICATION supabase_realtime ADD TABLE shifts; 