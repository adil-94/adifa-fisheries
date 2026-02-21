import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with explicit localStorage persistence
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
    storageKey: 'adifa-fisheries-auth-token',
    detectSessionInUrl: true
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
  
  // Redirect to the correct URL with the auth tokens
  window.location.href = 'https://adil-94.github.io/adifa-fisheries/' + hashPart;
}

// Process the auth tokens if they exist and we're on the correct path
if (hasAuthTokens && !isRootDomain) {
  // Let Supabase handle the auth tokens
  supabase.auth.getSession().then(({ data, error }) => {
    if (data?.session) {
      // Manually store the session in localStorage for extra persistence
      try {
        localStorage.setItem('adifa-fisheries-auth-manual', JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          user: data.session.user
        }));
      } catch (e) {
        console.error('Error storing session in localStorage:', e);
      }
      
      // Clear the hash to prevent infinite processing
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, document.title, window.location.pathname);
      }
    } else if (error) {
      console.error('Failed to establish session:', error);
    }
  });
}

// Try to restore session from manual storage if needed
try {
  const storedSession = localStorage.getItem('adifa-fisheries-auth-manual');
  if (storedSession && !hasAuthTokens) {
    const parsedSession = JSON.parse(storedSession);
    if (parsedSession.access_token && parsedSession.refresh_token) {
      supabase.auth.setSession({
        access_token: parsedSession.access_token,
        refresh_token: parsedSession.refresh_token
      }).catch(err => {
        console.error('Error restoring session:', err);
      });
    }
  }
} catch (e) {
  console.error('Error parsing stored session:', e);
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
