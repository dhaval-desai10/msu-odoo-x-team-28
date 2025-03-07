import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import CommunityDashboard from '../../components/CommunityDashboard';

const CommunityPage = ({ id }) => {
  const [community, setCommunity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCommunity = async () => {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(error);
        setIsLoading(false);
        return;
      }

      setCommunity(data);
      setIsLoading(false);
    };

    fetchCommunity();
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (!community) return <div>Community not found</div>;

  return <CommunityDashboard community={community} />;
};

export default CommunityPage; 