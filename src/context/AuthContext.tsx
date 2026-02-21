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
          setUser(data.session.user);
          setLoading(false);
          return;
        }
        
        // If no session, try to restore from manual storage
        const storedSession = localStorage.getItem('adifa-fisheries-auth-manual');
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          if (parsedSession.user) {
            setUser(parsedSession.user);
            
            // Also restore the session in Supabase
            if (parsedSession.access_token && parsedSession.refresh_token) {
              await supabase.auth.setSession({
                access_token: parsedSession.access_token,
                refresh_token: parsedSession.refresh_token
              });
            }
          } else {
            setUser(null);
          }
        } else {
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
      if (session?.user) {
        setUser(session.user);
        
        // Store session in manual storage for extra persistence
        try {
          localStorage.setItem('adifa-fisheries-auth-manual', JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            user: session.user
          }));
        } catch (e) {
          console.error('Error storing session in localStorage:', e);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('adifa-fisheries-auth-manual');
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Clear manual storage first
    localStorage.removeItem('adifa-fisheries-auth-manual');
    
    // Then sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
