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
    // Check for session on mount
    const checkSession = async () => {
      try {
        console.log('Checking for existing session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        if (data?.session) {
          console.log('Found existing session for:', data.session.user.email);
          setUser(data.session.user);
        } else {
          console.log('No existing session found');
          setUser(null);
        }
      } catch (err) {
        console.error('Unexpected error checking session:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in context:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in to context:', session.user.email);
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out from context');
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
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
