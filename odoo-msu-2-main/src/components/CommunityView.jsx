import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const CommunityView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunity = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        console.log('Fetching community with ID:', id);
        
        // Fetch community details
        const { data, error } = await supabase
          .from('communities')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          console.error('Error fetching community:', error);
          setError(error.message);
          throw error;
        }
        
        if (!data) {
          console.error('No community found with ID:', id);
          setError('Community not found');
          throw new Error('Community not found');
        }
        
        console.log('Community data:', data);
        setCommunity(data);
        
        // Fetch community members
        const { data: membersData, error: membersError } = await supabase
          .from('community_members')
          .select('*, user:user_id(*)')
          .eq('community_id', id);
          
        if (membersError) {
          console.error('Error fetching members:', membersError);
          throw membersError;
        }
        
        console.log('Community members:', membersData);
        setMembers(membersData || []);
        
        // Check if current user is admin or member
        if (user) {
          const isUserAdmin = data.admin_id === user.id;
          setIsAdmin(isUserAdmin);
          
          const userMembership = membersData?.find(m => m.user_id === user.id);
          setIsMember(!!userMembership);
        }
      } catch (error) {
        console.error('Error fetching community data:', error);
        setError(error.message || 'Failed to load community information');
        toast.error('Failed to load community information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCommunity();
  }, [id, user]);
  
  const handleJoinCommunity = async () => {
    if (!user) {
      toast.error('Please log in to join this community');
      navigate('/login');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('community_members')
        .insert([
          {
            community_id: id,
            user_id: user.id,
            joined_at: new Date().toISOString()
          }
        ]);
        
      if (error) throw error;
      
      toast.success('You have joined the community!');
      setIsMember(true);
      
      // Refresh members list
      const { data: membersData } = await supabase
        .from('community_members')
        .select('*, user:user_id(*)')
        .eq('community_id', id);
        
      setMembers(membersData || []);
    } catch (error) {
      console.error('Error joining community:', error);
      toast.error('Failed to join the community');
    }
  };
  
  if (isLoading) {
    return (
      <div className="pt-20 flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error || !community) {
    return (
      <div className="pt-20 flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h2 className="text-2xl font-bold mb-4">Community Not Found</h2>
        <p className="text-gray-400 mb-6">{error || "The community you're looking for doesn't exist or has been removed."}</p>
        <button 
          onClick={() => navigate('/join')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Browse Communities
        </button>
      </div>
    );
  }
  
  return (
    <div className="pt-20 min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div 
          className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold mb-3">{community.name}</h1>
              <p className="text-gray-300 mb-4">{community.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                <span className="flex items-center bg-gray-700 px-3 py-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </span>
                <span className="flex items-center bg-gray-700 px-3 py-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Created {new Date(community.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center bg-gray-700 px-3 py-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {community.contribution_period.charAt(0).toUpperCase() + community.contribution_period.slice(1)} contributions
                </span>
              </div>
              
              {isAdmin && (
                <div className="mt-4 flex items-center text-indigo-400">
                  <span className="text-sm mr-2">Invite code:</span>
                  <span className="bg-gray-700 px-2 py-1 rounded font-mono text-sm">{community.invite_code}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(community.invite_code);
                      toast.success('Invite code copied to clipboard!');
                    }}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            <div>
              {user ? (
                isMember ? (
                  <button 
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg opacity-75 cursor-not-allowed"
                    disabled
                  >
                    You're a Member
                  </button>
                ) : (
                  <button 
                    onClick={handleJoinCommunity}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Join Community
                  </button>
                )
              ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Log In to Join
                </button>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8">
            <h2 className="text-xl font-bold mb-6">Community Members ({members.length})</h2>
            
            {members.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {members.map((member, index) => (
                  <motion.div 
                    key={member.id || index}
                    className="bg-gray-700 rounded-lg p-4 flex items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {member.user?.email?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-white font-medium truncate">
                        {member.user?.email?.split('@')[0] || 'Unknown User'}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">
                        {member.user_id === community.admin_id ? 'Admin' : 'Member'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No members in this community yet.</p>
            )}
          </div>
          
          {isAdmin && (
            <div className="mt-12 pt-8 border-t border-gray-700">
              <h2 className="text-xl font-bold mb-6">Admin Controls</h2>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => toast.success('This feature is coming soon!')}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                >
                  Edit Community
                </button>
                <button
                  onClick={() => toast.success('This feature is coming soon!')}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                >
                  Manage Members
                </button>
                <button
                  onClick={() => toast.success('This feature is coming soon!')}
                  className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-white transition-colors"
                >
                  Delete Community
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityView; 