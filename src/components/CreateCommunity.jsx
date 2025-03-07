import { useState } from 'react';
import { supabase } from '../utils/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreateCommunity = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateCommunity = async () => {
    if (!name || !description) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const { data: community, error } = await supabase
        .from('communities')
        .insert([{ name, description, admin_id: supabase.auth.user().id }])
        .single();

      if (error) throw error;

      toast.success('Community created successfully!');
      navigate(`/community/${community.id}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Create a Community</h2>
      <div className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Community Name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Community Description"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          rows="3"
        />
        <button
          onClick={handleCreateCommunity}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Create Community'
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateCommunity; 