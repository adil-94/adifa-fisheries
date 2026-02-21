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
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  }
});

// Check if we're on the authentication callback page with tokens
const hasAuthTokens = window.location.hash && window.location.hash.includes('access_token=');

// Handle auth redirects for GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');
const isRootDomain = isGitHubPages && !window.location.pathname.includes('/adifa-fisheries/');

// IMPORTANT: Only redirect once from root domain to app with auth tokens
if (isRootDomain && hasAuthTokens) {
  // Extract the hash portion with the auth tokens
  const hashPart = window.location.hash;
  console.log('Redirecting from root domain to app with auth tokens');
  
  // Redirect to the correct URL with the auth tokens
  window.location.href = 'https://adil-94.github.io/adifa-fisheries/' + hashPart;
}

// Process the auth tokens if they exist and we're on the correct path
if (hasAuthTokens && !isRootDomain) {
  console.log('Processing auth tokens from URL');
  
  // Let Supabase handle the auth tokens
  supabase.auth.getSession().then(({ data, error }) => {
    if (data?.session) {
      console.log('Session established successfully:', data.session.user.email);
      // Store session in localStorage for persistence
      localStorage.setItem('adifa-fisheries-auth-session', JSON.stringify(data.session));
      
      // Clear the hash to prevent infinite processing
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, document.title, window.location.pathname);
      }
    } else {
      console.error('Failed to establish session:', error);
    }
  });
}

// Custom sign-in function to use the correct redirect URL
export async function signInWithEmail(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'https://adil-94.github.io/adifa-fisheries/',
    },
  });
}
