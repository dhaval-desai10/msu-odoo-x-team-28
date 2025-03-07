import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';

const AuthProvider = ({ children }) => {
  const initialize = useAuthStore((state) => state.initialize);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Immediately check for a valid token in localStorage
    const checkAndRestoreSession = async () => {
      console.log('Checking for existing auth session...');
      
      try {
        // First check if we have the token in localStorage directly
        const tokenString = localStorage.getItem('thrive-together-auth-token') || 
                           localStorage.getItem('supabase.auth.token');
        
        if (tokenString) {
          console.log('Found auth token in localStorage');
        }

        // Get the current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          useAuthStore.setState({ isLoading: false });
          setAppReady(true);
          return;
        }
        
        if (session) {
          console.log('Valid session found, restoring user state...');
          // Initialize auth store with the session data
          await initialize();
          console.log('User session restored successfully');
        } else {
          console.log('No valid session found');
          useAuthStore.setState({ isLoading: false });
        }
      } catch (error) {
        console.error('Error in session restoration:', error);
        useAuthStore.setState({ isLoading: false });
      }
      
      setAppReady(true);
    };

    // Run the check immediately when the app loads
    checkAndRestoreSession();

    // Set up auth state change listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('User signed in or token refreshed');
          // Re-initialize to fetch the latest user data and profile
          await initialize();
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          // Clear user data
          useAuthStore.setState({ user: null, profile: null, isLoading: false });
        }
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [initialize]);

  // Show nothing until we've checked for a session
  if (!appReady) {
    return null; // Or return a loading spinner
  }

  return children;
};

export default AuthProvider;