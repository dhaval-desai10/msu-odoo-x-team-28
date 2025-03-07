import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const { user, profile, updateProfile, signOut, isLoading } = useAuthStore();
  
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);
  
  const handleSignOut = async () => {
    const result = await signOut();
    if (result && result.success) {
      toast.success('Signed out successfully');
    } else {
      toast.error('Failed to sign out');
    }
  };
  
  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      const result = await updateProfile({
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });
      
      if (result && result.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!user) {
    return (
      <div className="pt-16 min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl shadow-2xl p-10 max-w-md w-full mx-4 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">Profile Access</h2>
            <p className="text-gray-300 mb-8">Please log in to view or edit your profile</p>
            
            <div className="space-y-4">
              <Link 
                to="/login"
                className="block w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
              >
                Log In
              </Link>
              <Link 
                to="/signup"
                className="block w-full py-3 px-6 bg-transparent border border-gray-600 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-all duration-300"
              >
                Create Account
              </Link>
            </div>
            
            <div className="mt-10 pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm">Manage your account settings and preferences</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pt-16 min-h-screen bg-gray-900 text-gray-100">
      <Toaster position="top-center" />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-800 to-purple-900 p-8 relative overflow-hidden">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-sm group-hover:blur opacity-80 group-hover:opacity-100 transition-all duration-300"></div>
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={fullName || 'User'} 
                      className="relative w-32 h-32 rounded-full object-cover border-4 border-gray-700 group-hover:border-indigo-400 transition-all duration-300"
                    />
                  ) : (
                    <div className="relative w-32 h-32 rounded-full bg-gray-700 text-white flex items-center justify-center text-4xl font-bold group-hover:bg-indigo-400 transition-all duration-300">
                      {fullName ? fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  {isEditing && (
                    <button 
                      className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
                      onClick={() => {/* Open avatar upload dialog */}}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="text-center md:text-left">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-transparent border-b border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-indigo-400 transition-colors w-full md:w-auto"
                        placeholder="Your full name"
                      />
                    ) : (
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                        {fullName || 'Welcome!'}
                      </span>
                    )}
                  </h1>
                  <p className="text-gray-300">{user.email}</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="md:ml-auto mt-6 md:mt-0">
                  {isEditing ? (
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-5 rounded-lg transition-colors"
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveProfile}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-5 rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : 'Save'}
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-5 rounded-lg transition-colors"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profile Content */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-300 mb-4">Account Information</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-300">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="text-gray-300 text-sm font-mono">{user.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Sign In</p>
                      <p className="text-gray-300">
                        {user.last_sign_in_at 
                          ? new Date(user.last_sign_in_at).toLocaleString() 
                          : 'First session'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-bold text-gray-300 mb-4">Account Actions</h2>
                  <div className="space-y-4">
                    <button 
                      onClick={() => {/* Open change password dialog */}}
                      className="w-full text-left px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Change Password
                    </button>
                    
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 5a1 1 0 10-2 0v4.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 12.586V8z" clipRule="evenodd" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;