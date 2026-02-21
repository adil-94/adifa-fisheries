import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with appropriate auth settings
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Check if we're on the authentication callback page with tokens
const hasAuthTokens = window.location.hash && window.location.hash.includes('access_token=');

// Handle auth redirects for GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');
const isRootDomain = isGitHubPages && !window.location.pathname.includes('/adifa-fisheries/');

// If we're at the root domain with auth tokens, redirect to the correct path
if (isRootDomain && hasAuthTokens) {
  // Extract the hash portion with the auth tokens
  const hashPart = window.location.hash;
  
  // Redirect to the correct URL with the auth tokens
  window.location.href = 'https://adil-94.github.io/adifa-fisheries/' + hashPart;
}

// Process the auth tokens if they exist
if (hasAuthTokens) {
  // Let Supabase handle the auth tokens
  supabase.auth.getSession().then(({ data }) => {
    if (data?.session) {
      console.log('User is authenticated');
    }
  });
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

// Custom sign-in function to use the correct redirect URL
export async function signInWithEmail(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'https://adil-94.github.io/adifa-fisheries/',
    },
  });
}
