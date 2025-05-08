DO $$ BEGIN
  -- Create calendar_notes table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'calendar_notes') THEN
    CREATE TABLE calendar_notes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      date DATE NOT NULL,
      notes TEXT,
      user_id UUID REFERENCES auth.users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(date)
    );
  END IF;

  -- Create calendar_comments table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'calendar_comments') THEN
    CREATE TABLE calendar_comments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      date DATE NOT NULL,
      author VARCHAR(255) NOT NULL,
      author_id UUID NOT NULL,
      avatar_url TEXT,
      content TEXT NOT NULL,
      user_id UUID REFERENCES auth.users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_calendar_notes_date ON calendar_notes(date);
CREATE INDEX IF NOT EXISTS idx_calendar_comments_date ON calendar_comments(date);

-- Enable RLS
ALTER TABLE calendar_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON calendar_notes FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Allow authenticated users to insert" ON calendar_notes FOR INSERT TO authenticated USING (true);
CREATE POLICY "Allow users to update own notes" ON calendar_notes FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow public read access" ON calendar_comments FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Allow authenticated users to insert" ON calendar_comments FOR INSERT TO authenticated USING (true);
CREATE POLICY "Allow users to update own comments" ON calendar_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete own comments" ON calendar_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'calendar_notes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE calendar_notes;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'calendar_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE calendar_comments;
  END IF;
END $$;