import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Determine if we're on GitHub Pages or local development
const isGitHubPages = window.location.hostname.includes('github.io');

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

// Configure site URL for auth redirects
if (isGitHubPages) {
  // For GitHub Pages deployment
  const siteUrl = 'https://adil-94.github.io/adifa-fisheries/';
  
  // Set up auth configuration for GitHub Pages
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') {
      // Redirect to the app home page after sign-in
      window.location.href = siteUrl;
    }
  });
}
