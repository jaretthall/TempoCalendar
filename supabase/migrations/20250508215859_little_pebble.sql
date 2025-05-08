-- Create calendar_notes table
CREATE TABLE IF NOT EXISTS calendar_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  notes TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Create calendar_comments table
CREATE TABLE IF NOT EXISTS calendar_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  author VARCHAR(255) NOT NULL,
  author_id UUID NOT NULL,
  avatar_url TEXT,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_notes_date ON calendar_notes(date);
CREATE INDEX IF NOT EXISTS idx_calendar_comments_date ON calendar_comments(date);

-- Enable row-level security
ALTER TABLE calendar_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for calendar_notes
DROP POLICY IF EXISTS "Users can view all notes" ON calendar_notes;
CREATE POLICY "Users can view all notes"
  ON calendar_notes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert notes" ON calendar_notes;
CREATE POLICY "Authenticated users can insert notes"
  ON calendar_notes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own notes" ON calendar_notes;
CREATE POLICY "Users can update their own notes"
  ON calendar_notes FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.users.raw_user_meta_data->>'role' = 'admin'
  ));

-- Create policies for calendar_comments
DROP POLICY IF EXISTS "Users can view all comments" ON calendar_comments;
CREATE POLICY "Users can view all comments"
  ON calendar_comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert comments" ON calendar_comments;
CREATE POLICY "Authenticated users can insert comments"
  ON calendar_comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own comments" ON calendar_comments;
CREATE POLICY "Users can update their own comments"
  ON calendar_comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON calendar_comments;
CREATE POLICY "Users can delete their own comments"
  ON calendar_comments FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.users.raw_user_meta_data->>'role' = 'admin'
  ));

-- Enable realtime subscriptions with checks
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'calendar_notes'
  ) THEN
    alter publication supabase_realtime add table calendar_notes;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'calendar_comments'
  ) THEN
    alter publication supabase_realtime add table calendar_comments;
  END IF;
END $$;