/*
  # Create community-related tables

  1. New Tables
    - `communities`
      - `id` (uuid, primary key)
      - `name` (text)
      - `admin_id` (uuid, references auth.users)
      - `member_limit` (integer)
      - `deposit_limit` (numeric)
      - `contribution_period` (text)
      - `invite_code` (text, unique)
      - `total_balance` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `community_members`
      - `id` (uuid, primary key)
      - `community_id` (uuid, references communities)
      - `user_id` (uuid, references auth.users)
      - `joined_at` (timestamptz)
    - `community_messages`
      - `id` (uuid, primary key)
      - `community_id` (uuid, references communities)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `type` (text)
      - `file_url` (text)
      - `created_at` (timestamptz)
    - `community_transactions`
      - `id` (uuid, primary key)
      - `community_id` (uuid, references communities)
      - `user_id` (uuid, references auth.users)
      - `amount` (numeric)
      - `type` (text)
      - `created_at` (timestamptz)
    - `withdrawal_requests`
      - `id` (uuid, primary key)
      - `community_id` (uuid, references communities)
      - `user_id` (uuid, references auth.users)
      - `amount` (numeric)
      - `reason` (text)
      - `document_url` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `withdrawal_votes`
      - `id` (uuid, primary key)
      - `request_id` (uuid, references withdrawal_requests)
      - `user_id` (uuid, references auth.users)
      - `vote` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
*/

-- Create communities table
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  member_limit INTEGER NOT NULL DEFAULT 50,
  deposit_limit NUMERIC,
  contribution_period TEXT CHECK (contribution_period IN ('daily', 'weekly', 'monthly', 'custom')),
  invite_code TEXT UNIQUE NOT NULL,
  total_balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create community_members table
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Create community_messages table
CREATE TABLE IF NOT EXISTS community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'file', 'system')),
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create community_transactions table
CREATE TABLE IF NOT EXISTS community_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  document_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create withdrawal_votes table
CREATE TABLE IF NOT EXISTS withdrawal_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES withdrawal_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('approve', 'reject')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(request_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for communities
CREATE POLICY "Anyone can view communities"
  ON communities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create communities"
  ON communities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update their communities"
  ON communities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_id);

-- Create policies for community_members
CREATE POLICY "Users can view community members"
  ON community_members
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM community_members cm
    WHERE cm.community_id = community_id AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Users can join communities"
  ON community_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for community_messages
CREATE POLICY "Community members can view messages"
  ON community_messages
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM community_members cm
    WHERE cm.community_id = community_id AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Community members can send messages"
  ON community_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_id AND cm.user_id = auth.uid()
    )
  );

-- Create policies for community_transactions
CREATE POLICY "Community members can view transactions"
  ON community_transactions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM community_members cm
    WHERE cm.community_id = community_id AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Community members can create transactions"
  ON community_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_id AND cm.user_id = auth.uid()
    )
  );

-- Create policies for withdrawal_requests
CREATE POLICY "Community members can view withdrawal requests"
  ON withdrawal_requests
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM community_members cm
    WHERE cm.community_id = community_id AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Community members can create withdrawal requests"
  ON withdrawal_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "System can update withdrawal requests"
  ON withdrawal_requests
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM community_members cm
    WHERE cm.community_id = community_id AND cm.user_id = auth.uid()
  ));

-- Create policies for withdrawal_votes
CREATE POLICY "Community members can view votes"
  ON withdrawal_votes
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM withdrawal_requests wr
    JOIN community_members cm ON wr.community_id = cm.community_id
    WHERE wr.id = request_id AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Community members can vote"
  ON withdrawal_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM withdrawal_requests wr
      JOIN community_members cm ON wr.community_id = cm.community_id
      WHERE wr.id = request_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own votes"
  ON withdrawal_votes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Anyone can view documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');