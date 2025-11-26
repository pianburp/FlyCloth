-- Add phone and address columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update the updated_at trigger if it doesn't exist (assuming it might be handled by application logic or another trigger, but good to have)
-- For now just the columns.
