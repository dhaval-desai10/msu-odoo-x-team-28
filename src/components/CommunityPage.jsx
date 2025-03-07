import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const CommunityPage = () => {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        // Fetch community details
        const { data: communityData, error: communityError } = await supabase
          .from('communities')
          .select('*')
          .eq('id', id)
          .single();

        if (communityError) throw communityError;

        // Fetch community members
        const { data: membersData, error: membersError } = await supabase
          .from('community_members')
          .select('*, profiles(id, full_name, avatar_url)')
          .eq('community_id', id);

        if (membersError) throw membersError;

        setCommunity(communityData);
        setMembers(membersData);
      } catch (error) {
        toast.error('Failed to fetch community data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunityData();
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (!community) return <div>Community not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{community.name}</h1>
          <p className="text-gray-600 mb-4">{community.description}</p>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Balance:</span>
              <span className="font-medium text-gray-800">
                ${community.balance.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Members:</span>
              <span className="font-medium text-gray-800">
                {members.length}
              </span>
            </div>
          </div>

          {/* Members List */}
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Members</h2>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center">
                  {member.profiles?.avatar_url ? (
                    <img
                      src={member.profiles.avatar_url}
                      alt={member.profiles.full_name || 'Member'}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <span className="text-gray-600 font-medium">
                        {(member.profiles?.full_name || 'User').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800">
                      {member.profiles?.full_name || 'Anonymous User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage; 