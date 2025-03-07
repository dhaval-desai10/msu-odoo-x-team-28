import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Community Types
interface Community {
  id: string
  name: string
  description: string
  creation_date: string
  members_count: number
  rules: string[]
  categories: string[]
  tags: string[]
  avatar_url?: string
  banner_url?: string
  created_by: string
}

// Create a new community
export async function createCommunity(communityData: Partial<Community>) {
  const { data, error } = await supabase
    .from('communities')
    .insert([communityData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Get a community by ID
export async function getCommunity(id: string) {
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// Join a community
export async function joinCommunity(communityId: string, userId: string) {
  const { data, error } = await supabase
    .from('user_memberships')
    .insert([{
      user_id: userId,
      community_id: communityId,
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Leave a community
export async function leaveCommunity(communityId: string, userId: string) {
  const { error } = await supabase
    .from('user_memberships')
    .delete()
    .match({ user_id: userId, community_id: communityId })
  
  if (error) throw error
}

// Save a community
export async function saveCommunity(communityId: string, userId: string) {
  const { data, error } = await supabase
    .from('saved_communities')
    .insert([{
      user_id: userId,
      community_id: communityId,
    }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Unsave a community
export async function unsaveCommunity(communityId: string, userId: string) {
  const { error } = await supabase
    .from('saved_communities')
    .delete()
    .match({ user_id: userId, community_id: communityId })
  
  if (error) throw error
}

// Get user's joined communities
export async function getUserCommunities(userId: string) {
  const { data, error } = await supabase
    .from('user_memberships')
    .select(`
      *,
      communities (*)
    `)
    .eq('user_id', userId)
  
  if (error) throw error
  return data
}

// Get user's saved communities
export async function getUserSavedCommunities(userId: string) {
  const { data, error } = await supabase
    .from('saved_communities')
    .select(`
      *,
      communities (*)
    `)
    .eq('user_id', userId)
  
  if (error) throw error
  return data
} 