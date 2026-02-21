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

console.log('Supabase client initialized with URL:', supabaseUrl);
console.log('Current location:', window.location.href);

// Check if we're on the authentication callback page with tokens
const hasAuthTokens = window.location.hash && window.location.hash.includes('access_token=');

// Handle auth redirects for GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');
const isRootDomain = isGitHubPages && !window.location.pathname.includes('/adifa-fisheries/');

console.log('Authentication state:', { 
  hasAuthTokens, 
  isGitHubPages, 
  isRootDomain, 
  hash: window.location.hash 
});

// If we're at the root domain with auth tokens, redirect to the correct path
if (isRootDomain && hasAuthTokens) {
  // Extract the hash portion with the auth tokens
  const hashPart = window.location.hash;
  console.log('Redirecting from root domain to app with auth tokens');
  
  // Redirect to the correct URL with the auth tokens
  window.location.href = 'https://adil-94.github.io/adifa-fisheries/' + hashPart;
}

// Process the auth tokens if they exist
if (hasAuthTokens) {
  console.log('Processing auth tokens from URL');
  
  // Let Supabase handle the auth tokens
  supabase.auth.getSession().then(({ data, error }) => {
    if (data?.session) {
      console.log('Session established successfully:', data.session.user.email);
      // Store session in localStorage for persistence
      localStorage.setItem('adifa-fisheries-session', JSON.stringify(data.session));
    } else {
      console.error('Failed to establish session:', error);
    }
  });
}

// Single auth state change handler to avoid duplicates
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.email);
  
  if (event === 'SIGNED_IN') {
    console.log('User signed in successfully');
    
    // Force refresh the page to ensure the app recognizes the authenticated state
    if (isGitHubPages && window.location.pathname.includes('/adifa-fisheries/')) {
      console.log('Refreshing app to apply authenticated state');
      window.location.reload();
    }
    
    // Redirect to the app home page after sign-in if on GitHub Pages but at wrong path
    if (isGitHubPages && !window.location.href.includes('/adifa-fisheries/')) {
      console.log('Redirecting to app from incorrect path');
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
