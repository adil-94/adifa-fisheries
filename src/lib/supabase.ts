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

// Log the URL for debugging
console.log('Supabase initialized with URL:', supabaseUrl);
console.log('Current URL:', window.location.href);

// Check if we're on GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');

// Check if we're on the authentication callback page with tokens
const hasAuthTokens = 
  (window.location.hash && (
    window.location.hash.includes('access_token=') || 
    window.location.hash.includes('error=') || 
    window.location.hash.includes('type=recovery')
  )) ||
  (window.location.search && (
    window.location.search.includes('access_token=') || 
    window.location.search.includes('error=') || 
    window.location.search.includes('type=recovery')
  ));

// Create a direct manual storage function to ensure localStorage works
function storeSessionManually(session: any) {
  try {
    // Test localStorage availability
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    
    // Store session directly
    const sessionData = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: session.user,
      expires_at: session.expires_at
    };
    
    // Store in two locations for redundancy
    localStorage.setItem('adifa-fisheries-auth-manual', JSON.stringify(sessionData));
    localStorage.setItem('adifa-auth-backup', JSON.stringify(sessionData));
    
    return true;
  } catch (e) {
    console.error('Error accessing localStorage:', e);
    return false;
  }
}

// Process auth tokens if present
if (hasAuthTokens) {
  console.log('Auth tokens detected in URL');
  console.log('URL hash:', window.location.hash);
  console.log('URL search params:', window.location.search);
  console.log('On GitHub Pages:', isGitHubPages ? 'Yes' : 'No');
  
  // Let Supabase handle the auth tokens
  console.log('Checking for session...');
  
  // First try to exchange the token in the URL for a session
  supabase.auth.getSession().then(({ data, error }) => {
    if (data?.session) {
      console.log('Session established successfully');
      console.log('User email:', data.session.user.email);
      console.log('Session expires at:', new Date(data.session.expires_at! * 1000).toLocaleString());
      
      // Use our manual storage function to ensure localStorage works
      const stored = storeSessionManually(data.session);
      console.log('Session stored in localStorage:', stored ? 'Success' : 'Failed');
      
      if (stored) {
        console.log('localStorage keys:', Object.keys(localStorage));
      }
      
      // Remove the hash to prevent token exposure and repeated processing
      if (window.history && window.history.replaceState) {
        // First store the current path without the hash
        const currentPath = window.location.pathname;
        console.log('Current path before clearing hash:', currentPath);
        
        // Clear the hash but keep the path
        window.history.replaceState(
          null, 
          document.title, 
          currentPath
        );
        console.log('URL hash cleared, path preserved');
      }
      
      // Force redirect to the main app page
      console.log('Redirecting to main app page');
      setTimeout(() => {
        // Use setTimeout to ensure the history state is updated first
        window.location.href = '#/';
        console.log('Redirect complete');
      }, 100);
    } else if (error) {
      console.error('Failed to establish session:', error);
      // Redirect to login page on error
      window.location.href = '#/login';
    } else {
      console.log('No session and no error - authentication may have failed silently');
      // Check if we're already on the login page
      if (!window.location.hash.includes('/login')) {
        console.log('Redirecting to login page');
        window.location.href = '#/login';
      }
    }
  }).catch(err => {
    console.error('Unexpected error during authentication:', err);
    window.location.href = '#/login';
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
  // Always use the exact URL configured in Supabase for GitHub Pages
  const redirectUrl = 'https://adil-94.github.io/adifa-fisheries/';
    
  console.log('Signing in with redirect URL:', redirectUrl);
  
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });
}
