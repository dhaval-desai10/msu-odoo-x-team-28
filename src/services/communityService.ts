import { supabase } from '../lib/supabase'

export interface Community {
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
}

export const communityService = {
  // Fetch community details
  async getCommunity(id: string) {
    const { data, error } = await supabase
      .from('communities')
      .select(`
        *,
        user_memberships (
          user_id,
          role,
          status
        ),
        saved_communities (
          user_id
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Join community
  async joinCommunity(communityId: string, userId: string) {
    const { data, error } = await supabase
      .from('user_memberships')
      .insert([
        {
          user_id: userId,
          community_id: communityId,
          role: 'member',
          status: 'active'
        }
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Leave community
  async leaveCommunity(communityId: string, userId: string) {
    const { error } = await supabase
      .from('user_memberships')
      .delete()
      .match({ 
        user_id: userId,
        community_id: communityId 
      })

    if (error) throw error
    return true
  },

  // Save community
  async saveCommunity(communityId: string, userId: string) {
    const { data, error } = await supabase
      .from('saved_communities')
      .insert([
        {
          user_id: userId,
          community_id: communityId
        }
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Unsave community
  async unsaveCommunity(communityId: string, userId: string) {
    const { error } = await supabase
      .from('saved_communities')
      .delete()
      .match({ 
        user_id: userId,
        community_id: communityId 
      })

    if (error) throw error
    return true
  },

  // Get user's communities
  async getUserCommunities(userId: string) {
    const { data, error } = await supabase
      .from('user_memberships')
      .select(`
        *,
        communities (*)
      `)
      .eq('user_id', userId)

    if (error) throw error
    return data
  },

  // Get user's saved communities
  async getUserSavedCommunities(userId: string) {
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
} 