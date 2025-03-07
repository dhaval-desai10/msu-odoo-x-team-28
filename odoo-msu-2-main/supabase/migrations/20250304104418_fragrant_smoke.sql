/*
  # Create savings-related tables

  1. New Tables
    - `savings_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `daily_goal` (numeric)
      - `current_streak` (integer)
      - `total_saved` (numeric)
      - `last_saved_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `savings_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `amount` (numeric)
      - `type` (text)
      - `created_at` (timestamptz)
    - `badges`
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text, unique)
      - `description` (text)
      - `icon` (text)
    - `user_badges`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `badge_id` (uuid, references badges)
      - `awarded_at` (timestamptz)
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
*/

-- Create savings_profiles table
CREATE TABLE IF NOT EXISTS savings_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  daily_goal NUMERIC NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  total_saved NUMERIC NOT NULL DEFAULT 0,
  last_saved_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create savings_transactions table
CREATE TABLE IF NOT EXISTS savings_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable Row Level Security
ALTER TABLE savings_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Create policies for savings_profiles
CREATE POLICY "Users can view their own savings profile"
  ON savings_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings profile"
  ON savings_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings profile"
  ON savings_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for savings_transactions
CREATE POLICY "Users can view their own savings transactions"
  ON savings_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings transactions"
  ON savings_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for badges
CREATE POLICY "Anyone can view badges"
  ON badges
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_badges
CREATE POLICY "Users can view their own badges"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
  ON user_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default badges
INSERT INTO badges (name, code, description, icon)
VALUES 
  ('Weekly Streak', 'weekly_streak', 'Save for 7 days in a row', '🔥'),
  ('Monthly Master', 'monthly_streak', 'Save for 30 days in a row', '🌟'),
  ('$100 Saver', 'savings_100', 'Save a total of $100', '💯')
ON CONFLICT (code) DO NOTHING;