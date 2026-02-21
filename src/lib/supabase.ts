import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with appropriate auth settings
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'adifa-fisheries-auth',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Handle auth redirects for GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');
const currentUrl = window.location.href;

// Check if we have an access token in the URL but are at the wrong path
if (isGitHubPages && currentUrl.includes('access_token=') && !currentUrl.includes('/adifa-fisheries/')) {
  // Extract the hash portion with the auth tokens
  const hashPart = window.location.hash;
  
  // Redirect to the correct URL with the auth tokens
  window.location.href = 'https://adil-94.github.io/adifa-fisheries/' + hashPart;
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in');
    
    // Redirect to the app home page after sign-in if on GitHub Pages
    if (isGitHubPages && !window.location.href.includes('/adifa-fisheries/')) {
      window.location.href = 'https://adil-94.github.io/adifa-fisheries/';
    }
  }
});
