import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { AuthContextType } from '../types';
import { PARTNERS } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getOwnerName = (email: string | undefined): string | null => {
    if (!email) return null;
    if (email === PARTNERS.ADIL.email) return PARTNERS.ADIL.name;
    if (email === PARTNERS.AEJAZ.email) return PARTNERS.AEJAZ.name;
    return null;
  };

  useEffect(() => {
    // Check for session from Supabase and manual storage
    const checkSession = async () => {
      try {
        // First try Supabase's built-in session
        const { data } = await supabase.auth.getSession();
        
        if (data?.session?.user) {
          console.log('Active session found in Supabase');
          setUser(data.session.user);
          
          // Also update manual storage with the latest session
          localStorage.setItem('adifa-fisheries-auth-manual', JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: data.session.user,
            expires_at: data.session.expires_at
          }));
          
          setLoading(false);
          return;
        }
        
        // If no session, try to restore from manual storage
        const storedSession = localStorage.getItem('adifa-fisheries-auth-manual');
        if (storedSession) {
          console.log('Attempting to restore from manual storage');
          const parsedSession = JSON.parse(storedSession);
          
          // Check if session is expired
          const now = Math.floor(Date.now() / 1000);
          if (parsedSession.expires_at && parsedSession.expires_at < now) {
            console.log('Stored session is expired');
            localStorage.removeItem('adifa-fisheries-auth-manual');
            setUser(null);
          } else if (parsedSession.user) {
            console.log('Using session from manual storage');
            setUser(parsedSession.user);
            
            // Also restore the session in Supabase
            if (parsedSession.access_token && parsedSession.refresh_token) {
              const { error } = await supabase.auth.setSession({
                access_token: parsedSession.access_token,
                refresh_token: parsedSession.refresh_token
              });
              
              if (error) {
                console.error('Failed to restore session in Supabase:', error);
                // If we can't restore in Supabase but have valid user data, still use it
              } else {
                console.log('Session restored in Supabase');
              }
            }
          } else {
            setUser(null);
          }
        } else {
          console.log('No stored session found');
          setUser(null);
        }
      } catch (err) {
        console.error('Session check error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();

    // Auth state subscription
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in:', session.user.email);
        setUser(session.user);
        
        // Store session in manual storage for extra persistence
        try {
          localStorage.setItem('adifa-fisheries-auth-manual', JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            user: session.user,
            expires_at: session.expires_at
          }));
        } catch (e) {
          console.error('Error storing session in localStorage:', e);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        localStorage.removeItem('adifa-fisheries-auth-manual');
        localStorage.removeItem('adifa-fisheries-auth');
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('Token refreshed');
        // Update stored session with refreshed tokens
        try {
          localStorage.setItem('adifa-fisheries-auth-manual', JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            user: session.user,
            expires_at: session.expires_at
          }));
        } catch (e) {
          console.error('Error updating session in localStorage:', e);
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Clear all storage first
    localStorage.removeItem('adifa-fisheries-auth-manual');
    localStorage.removeItem('adifa-fisheries-auth');
    
    // Then sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Force redirect to login page
    window.location.href = '#/login';
  };

  const ownerName = getOwnerName(user?.email);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, ownerName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
