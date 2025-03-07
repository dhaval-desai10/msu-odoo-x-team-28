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
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h1 className="mb-4 text-3xl font-bold text-gray-800">{community.name}</h1>
          <p className="mb-4 text-gray-600">{community.description}</p>
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

        
        </div>
      </div>
    </div>
  );
};

export default CommunityPage; 