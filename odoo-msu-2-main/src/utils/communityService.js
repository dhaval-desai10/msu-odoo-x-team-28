import { supabase } from '../lib/supabase';

/**
 * Creates a new community and handles all related operations
 */
export const createCommunity = async (communityData, userId) => {
  // Start a transaction by enabling a callback
  let communityId = null;

  try {
    // 1. Check if user profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // 2. Create profile if it doesn't exist
    if (profileError && profileError.code === 'PGRST116') {
      // Get user data to create profile
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw new Error('Failed to get user data: ' + userError.message);
      
      const user = userData.user;
      
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          full_name: user.user_metadata?.full_name || '',
          email: user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
        
      if (createProfileError) throw new Error('Failed to create profile: ' + createProfileError.message);
    } else if (profileError) {
      throw new Error('Error checking profile: ' + profileError.message);
    }

    // 3. Create the community
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .insert([{
        name: communityData.name,
        description: communityData.description,
        admin_id: userId,
        member_limit: communityData.memberLimit,
        deposit_limit: communityData.depositLimit,
        contribution_period: communityData.contributionPeriod,
        invite_code: communityData.inviteCode,
        total_balance: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
      
    if (communityError) throw new Error('Failed to create community: ' + communityError.message);
    if (!community || community.length === 0) throw new Error('No community data returned');
    
    communityId = community[0].id;

    // 4. Add creator as a member
    const { error: memberError } = await supabase
      .from('community_members')
      .insert([{
        community_id: communityId,
        user_id: userId,
        joined_at: new Date().toISOString()
      }]);
      
    if (memberError) throw new Error('Failed to add member: ' + memberError.message);

    // 5. Create welcome message
    const { error: messageError } = await supabase
      .from('community_messages')
      .insert([{
        community_id: communityId,
        user_id: userId,
        content: `Welcome to ${communityData.name}! This community was just created.`,
        type: 'system',
        created_at: new Date().toISOString()
      }]);
      
    if (messageError) throw new Error('Failed to create welcome message: ' + messageError.message);

    return { success: true, communityId };
  } catch (error) {
    console.error('Community creation error:', error);
    // If we created a community but failed at a later step, we should clean up
    if (communityId) {
      try {
        await supabase
          .from('communities')
          .delete()
          .eq('id', communityId);
      } catch (cleanupError) {
        console.error('Failed to clean up community:', cleanupError);
      }
    }
    return { success: false, error: error.message };
  }
};

/**
 * Fetches a community by ID with all related data
 */
export const getCommunity = async (communityId, userId) => {
  try {
    // 1. Get community details
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('*')
      .eq('id', communityId)
      .single();
      
    if (communityError) throw new Error('Failed to fetch community: ' + communityError.message);

    // 2. Check if user is a member
    const { data: memberCheck, error: memberCheckError } = await supabase
      .from('community_members')
      .select('*')
      .eq('community_id', communityId)
      .eq('user_id', userId)
      .single();
      
    if (memberCheckError && memberCheckError.code !== 'PGRST116') {
      throw new Error('Failed to check membership: ' + memberCheckError.message);
    }
    
    const isMember = !!memberCheck;
    const isAdmin = community.admin_id === userId;

    // 3. Get members with profiles
    const { data: members, error: membersError } = await supabase
      .from('community_members')
      .select('*, profiles(id, full_name, avatar_url)')
      .eq('community_id', communityId);
      
    if (membersError) throw new Error('Failed to fetch members: ' + membersError.message);

    // 4. Get messages if member
    let messages = [];
    if (isMember) {
      const { data: messagesData, error: messagesError } = await supabase
        .from('community_messages')
        .select('*, profiles(id, full_name, avatar_url)')
        .eq('community_id', communityId)
        .order('created_at', { ascending: true });
        
      if (messagesError) throw new Error('Failed to fetch messages: ' + messagesError.message);
      messages = messagesData || [];
    }

    return {
      success: true,
      community,
      members: members || [],
      messages,
      isMember,
      isAdmin
    };
  } catch (error) {
    console.error('Get community error:', error);
    return { success: false, error: error.message };
  }
}; 