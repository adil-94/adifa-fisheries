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
    storageKey: 'adifa-fisheries-auth',
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Check if we're on the authentication callback page with tokens
const hasAuthTokens = window.location.hash && window.location.hash.includes('access_token=');

// Handle auth redirects for GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');

// Process auth tokens if present
if (hasAuthTokens) {
  console.log('Auth tokens detected in URL');
  
  // Let Supabase handle the auth tokens
  supabase.auth.getSession().then(({ data, error }) => {
    if (data?.session) {
      console.log('Session established successfully');
      
      // Store session in localStorage for persistence
      try {
        localStorage.setItem('adifa-fisheries-auth-manual', JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          user: data.session.user,
          expires_at: data.session.expires_at
        }));
      } catch (e) {
        console.error('Error storing session in localStorage:', e);
      }
      
      // Remove the hash to prevent token exposure and repeated processing
      if (window.history && window.history.replaceState) {
        // Keep the path but remove the hash
        window.history.replaceState(
          null, 
          document.title, 
          window.location.pathname
        );
      }
      
      // Redirect to the main app page if we're not already there
      if (window.location.pathname === '/' || window.location.pathname === '/login') {
        window.location.href = '#/';
      }
    } else if (error) {
      console.error('Failed to establish session:', error);
      // Redirect to login page on error
      window.location.href = '#/login';
    }
  });
}

// Try to restore session from manual storage if needed
try {
  const storedSession = localStorage.getItem('adifa-fisheries-auth-manual');
  if (storedSession && !hasAuthTokens) {
    console.log('Found stored session, attempting to restore');
    const parsedSession = JSON.parse(storedSession);
    
    // Check if session is expired
    const now = Math.floor(Date.now() / 1000);
    if (parsedSession.expires_at && parsedSession.expires_at < now) {
      console.log('Stored session is expired, removing');
      localStorage.removeItem('adifa-fisheries-auth-manual');
    } else if (parsedSession.access_token && parsedSession.refresh_token) {
      // Restore the session
      supabase.auth.setSession({
        access_token: parsedSession.access_token,
        refresh_token: parsedSession.refresh_token
      }).then(({ data, error }) => {
        if (error) {
          console.error('Error restoring session:', error);
          localStorage.removeItem('adifa-fisheries-auth-manual');
        } else if (data?.session) {
          console.log('Session restored successfully');
        }
      });
    }
  }
} catch (e) {
  console.error('Error parsing stored session:', e);
  localStorage.removeItem('adifa-fisheries-auth-manual');
}

// Custom sign-in function with proper redirect URL
export async function signInWithEmail(email: string) {
  const redirectUrl = isGitHubPages
    ? 'https://adil-94.github.io/adifa-fisheries/'
    : window.location.origin;
    
  console.log('Signing in with redirect URL:', redirectUrl);
  
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });
}
