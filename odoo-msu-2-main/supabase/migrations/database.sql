-- Communities Table
CREATE TABLE communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  invite_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Memberships Table
CREATE TYPE member_role AS ENUM ('admin', 'moderator', 'member');
CREATE TYPE member_status AS ENUM ('active', 'banned');

CREATE TABLE user_memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  role member_role DEFAULT 'member',
  status member_status DEFAULT 'active',
  UNIQUE(user_id, community_id)
);

-- Saved Communities Table
CREATE TABLE saved_communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  save_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, community_id)
);

-- Community Members Table
CREATE TABLE community_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS (Row Level Security) Policies
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- Communities Policies
CREATE POLICY "Enable all for authenticated users" ON communities
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- User Memberships Policies
CREATE POLICY "Memberships are viewable by everyone"
  ON user_memberships FOR SELECT
  USING (true);

CREATE POLICY "Users can join communities"
  ON user_memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
  ON user_memberships FOR DELETE
  USING (auth.uid() = user_id);

-- Saved Communities Policies
CREATE POLICY "Saved communities are viewable by the owner"
  ON saved_communities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save communities"
  ON saved_communities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave communities"
  ON saved_communities FOR DELETE
  USING (auth.uid() = user_id);

-- Community Members Policies
CREATE POLICY "Enable all for authenticated users" ON community_members
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Test insert
INSERT INTO communities (
    name,
    description,
    admin_id,
    invite_code
) VALUES (
    'Test Community',
    'Test Description',
    '00000000-0000-0000-0000-000000000000', -- Replace with a real user ID
    'test123'
) RETURNING *; 