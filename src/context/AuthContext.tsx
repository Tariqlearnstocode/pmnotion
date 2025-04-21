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
    const fetchUserProfile = async (authUserId: string) => {
        // Prevent fetching if profile already loaded for this user
        if (userProfile && userProfile.id === authUserId) {
            return;
        }
        console.log(`Fetching profile for user: ${authUserId}`);
        try {
            setLoading(true); // Set loading only when we actually fetch
            const profile = await getUserProfileById(authUserId);
            setUserProfile(profile);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            setUserProfile(null);
        } finally {
            setLoading(false); // Set loading false after fetch attempt
        }
    };

    // Initial check
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      const initialAuthUser = initialSession?.user ?? null;
      setAuthUser(initialAuthUser);
      if (initialAuthUser) {
        await fetchUserProfile(initialAuthUser.id);
      } else {
        setUserProfile(null); // Clear profile if no initial user
      }
      setLoading(false); // Ensure loading is false after initial check
    }).catch(error => {
      console.error("Error getting initial session:", error);
      setUserProfile(null);
      setLoading(false);
    });

    // Listener for subsequent changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log('Auth state changed:', _event, currentSession?.user?.id);
        setSession(currentSession);
        const currentAuthUser = currentSession?.user ?? null;
        const previousAuthUserId = authUser?.id;

        // Update authUser state regardless
        setAuthUser(currentAuthUser);

        if (currentAuthUser) {
          // Fetch profile only if:
          // 1. The user ID has changed from the previous state OR
          // 2. We don't have a user profile loaded yet for the current user
          if (currentAuthUser.id !== previousAuthUserId || !userProfile || userProfile.id !== currentAuthUser.id) {
            await fetchUserProfile(currentAuthUser.id);
          } else {
            // User is the same and profile is already loaded, ensure loading is false
            setLoading(false);
          }
        } else {
          // No user, clear profile and set loading false
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [authUser?.id, userProfile]); // Add dependencies to re-evaluate if needed

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    // State updates (session, authUser, userProfile) will be handled by onAuthStateChange
  };

  const value = {
    session,
    authUser,
    userProfile,
    loading,
    signOut,
  };

  // Render children only when initial loading is complete?
  // Or show a loading indicator based on the `loading` state in consuming components.
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