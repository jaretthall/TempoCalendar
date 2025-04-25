# Database Migration Guide

The application is encountering errors because the database schema is missing some required columns in the `shifts` table. Follow these steps to update your database:

## Option 1: Using Supabase Dashboard (Recommended)

1. Log in to the [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Go to the SQL Editor
4. Create a new query
5. Paste the following SQL:

```sql
-- Add recurring shift columns to shifts table
ALTER TABLE shifts 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT,
ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMP WITH TIME ZONE;

-- Enable realtime for updated shifts table (reapply in case it was lost)
ALTER PUBLICATION supabase_realtime ADD TABLE shifts;
```

6. Click "Run" to execute the query
7. Refresh your application

## Option 2: Using Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
# Initialize your local environment if not done already
supabase init

# Run the migration
supabase db push

# Or apply specific migration
supabase db execute --file ./supabase/migrations/20240604000000_add_recurring_columns.sql
```

## Troubleshooting

If you continue to experience issues after running the migration:

1. Check the browser console for specific error messages
2. Make sure you're using the latest version of the application
3. Try clearing your browser cache
4. If problems persist, contact support 