import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Custom localStorage wrapper with error handling
const customLocalStorage = {
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      console.log(`Retrieved ${key} from localStorage:`, item ? 'Found' : 'Not found');
      return item;
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      console.log(`Saved ${key} to localStorage`);
    } catch (error) {
      console.error('Error setting item in localStorage:', error);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      console.log(`Removed ${key} from localStorage`);
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
    }
  }
};

// Create Supabase client with persistence explicitly configured
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'thrive-together-auth-token',
    storage: customLocalStorage
  }
});

// Immediately attempt to recover a session if one exists
export const recoverSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error recovering session:', error);
      return null;
    }
    
    if (data?.session) {
      console.log('Session recovered successfully');
      return data.session;
    } else {
      console.log('No session to recover');
      return null;
    }
  } catch (error) {
    console.error('Exception recovering session:', error);
    return null;
  }
};