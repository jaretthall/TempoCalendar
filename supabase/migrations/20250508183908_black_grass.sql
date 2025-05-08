```sql
-- Create default admin user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"role": "admin", "full_name": "Admin User"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Create profile for admin user
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  'Admin User',
  'admin'
) ON CONFLICT (id) DO NOTHING;
```