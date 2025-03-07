import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  error: null,
  sessionChecked: false,

  // Initialize the auth state
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        set({ 
          user: null, 
          profile: null, 
          isLoading: false, 
          error: sessionError.message,
          sessionChecked: true 
        });
        return;
      }
      
      if (session?.user) {
        console.log('Session found, user is logged in:', session.user.email);
        
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        // If profile doesn't exist, create one
        if (profileError && profileError.code === 'PGRST116') {
          // Create a new profile
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ 
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();
            
          if (createError) {
            console.error('Error creating profile:', createError);
            set({ 
              user: session.user,
              profile: null,
              isLoading: false,
              sessionChecked: true
            });
          } else {
            set({ 
              user: session.user,
              profile: newProfile,
              isLoading: false,
              sessionChecked: true
            });
          }
        } else {
          set({ 
            user: session.user,
            profile: profile || null,
            isLoading: false,
            sessionChecked: true
          });
        }
      } else {
        console.log('No session found, user is not logged in');
        set({ 
          user: null, 
          profile: null, 
          isLoading: false,
          sessionChecked: true
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ 
        user: null, 
        profile: null, 
        isLoading: false, 
        error: error.message,
        sessionChecked: true
      });
    }
  },

  // Check if a token exists and try to restore the session
  checkExistingSession: async () => {
    try {
      if (get().sessionChecked) {
        // Don't check again if we've already checked
        return { success: !!get().user };
      }
      
      set({ isLoading: true });
      console.log('Checking for existing session...');
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('Valid session exists, restoring auth state');
        await get().initialize();
        return { success: true };
      }
      
      console.log('No valid session exists');
      set({ 
        isLoading: false,
        sessionChecked: true
      });
      return { success: false };
    } catch (error) {
      console.error('Error checking existing session:', error);
      set({ 
        isLoading: false,
        error: error.message,
        sessionChecked: true
      });
      return { success: false, error: error.message };
    }
  },

  // Sign up a new user
  signUp: async ({ email, password, fullName }) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) throw error;
      
      // Create a profile for the new user
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ 
            id: data.user.id,
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
          
        if (profileError) {
          console.error('Error creating profile during signup:', profileError);
        }
      }
      
      set({ 
        user: data.user,
        isLoading: false 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error signing up:', error);
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Sign in an existing user
  signIn: async ({ email, password }) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      // If profile doesn't exist, create one
      if (profileError && profileError.code === 'PGRST116') {
        // Create a new profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ 
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating profile during signin:', createError);
          set({ 
            user: data.user,
            profile: null,
            isLoading: false 
          });
        } else {
          set({ 
            user: data.user,
            profile: newProfile,
            isLoading: false 
          });
        }
      } else {
        set({ 
          user: data.user,
          profile: profile || null,
          isLoading: false 
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error signing in:', error);
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Sign out the current user
  signOut: async () => {
    try {
      set({ isLoading: true });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      set({ user: null, profile: null, isLoading: false });
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Update the user's profile
  updateProfile: async (updates) => {
    try {
      set({ isLoading: true, error: null });
      
      const { user } = useAuthStore.getState();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      set({ 
        profile: data,
        isLoading: false 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Helper to check if user is logged in
  isLoggedIn: () => {
    return !!useAuthStore.getState().user;
  }
}));

// Immediately try to recover any existing session when this module is imported
useAuthStore.getState().checkExistingSession();

export default useAuthStore;