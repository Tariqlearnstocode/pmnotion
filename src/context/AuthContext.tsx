import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User as AuthUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { getUserProfileById } from '../services/users';
import type { User as UserProfile } from '../types';

interface AuthContextType {
  session: Session | null;
  authUser: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const fetchUserProfile = async (authUserId: string) => {
        try {
            const profile = await getUserProfileById(authUserId);
            setUserProfile(profile);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setUserProfile(null);
        }
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const currentAuthUser = session?.user ?? null;
      setAuthUser(currentAuthUser);
      if (currentAuthUser) {
        await fetchUserProfile(currentAuthUser.id);
      }
      setLoading(false);

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          console.log('Auth state changed:', _event, session?.user?.id);
          setSession(session);
          const newAuthUser = session?.user ?? null;
          setAuthUser(newAuthUser);
          
          if (newAuthUser) {
            setLoading(true);
            await fetchUserProfile(newAuthUser.id);
            setLoading(false);
          } else {
            setUserProfile(null);
            setLoading(false);
          }
        }
      );

      return () => {
        authListener?.subscription.unsubscribe();
      };
    }).catch(error => {
      console.error("Error getting initial session:", error);
      setUserProfile(null);
      setLoading(false);
    });
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    session,
    authUser,
    userProfile,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 