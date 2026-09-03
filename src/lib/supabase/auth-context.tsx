'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from './client';
import { isSupabaseConfigured } from './config';
import { UserProfile, UserRole } from '../../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  isAuthenticated: boolean;
  isOwner: boolean;
  isTenant: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    metadata: { name: string; phone: string; role?: 'tenant' | 'owner' }
  ) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: {
    name?: string;
    phone?: string;
    whatsapp_number?: string;
    avatar_url?: string;
  }) => Promise<{ error?: string }>;
  setDemoUser: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Preset demo accounts for quick testing and verification across roles
const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  owner: {
    id: 'demo-owner-mymensingh',
    phone: '01711223344',
    name: 'আব্দুর রহমান (মালিক)',
    email: 'landlord@toletmymensingh.com',
    role: 'owner',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    is_verified: true,
    whatsapp_number: '01711223344',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  tenant: {
    id: 'demo-tenant-mymensingh',
    phone: '01899887766',
    name: 'তানভীর আহমেদ (ভাড়াটিয়া)',
    email: 'tanvir.student@gmail.com',
    role: 'tenant',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    is_verified: false,
    whatsapp_number: '01899887766',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  admin: {
    id: 'demo-admin-mymensingh',
    phone: '01900112233',
    name: 'অ্যাডমিন মডারেটর (ময়মনসিংহ)',
    email: 'admin@toletmymensingh.com',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    is_verified: true,
    whatsapp_number: '01900112233',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('tolet_active_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  const fetchProfile = async (userId: string) => {
    const client = getSupabaseBrowserClient();
    if (!client) return;

    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        const loadedProfile: UserProfile = {
          id: data.id,
          phone: data.phone,
          name: data.name,
          email: data.email || undefined,
          role: data.role as UserRole,
          avatar_url: data.avatar_url || undefined,
          is_verified: data.is_verified,
          whatsapp_number: data.whatsapp_number || undefined,
          created_at: data.created_at,
          updated_at: data.updated_at || data.created_at,
        };
        setProfile(loadedProfile);
        try {
          localStorage.setItem('tolet_active_profile', JSON.stringify(loadedProfile));
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      setIsLoading(false);
      return;
    }

    // Get current session
    client.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        fetchProfile(existingSession.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else if (!localStorage.getItem('tolet_demo_role')) {
        setProfile(null);
        localStorage.removeItem('tolet_active_profile');
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return { error: 'Supabase client is not configured.' };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        let msg = error.message;
        if (error.message.includes('Invalid login credentials')) {
          msg = 'ভুল ইমেইল অথবা পাসওয়ার্ড প্রদান করেছেন। অনুগ্রহ করে পুনরায় চেষ্টা করুন।';
        }
        return { error: msg };
      }
      if (data.user) {
        localStorage.removeItem('tolet_demo_role');
        await fetchProfile(data.user.id);
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Login failed' };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    metadata: { name: string; phone: string; role?: 'tenant' | 'owner' }
  ) => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return { error: 'Supabase client is not configured.' };
    }

    // SECURITY ENFORCEMENT: Never trust client to pass 'admin'.
    // Only 'tenant' and 'owner' are permitted on registration.
    const safeRole: 'tenant' | 'owner' = metadata.role === 'owner' ? 'owner' : 'tenant';

    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name,
            phone: metadata.phone,
            role: safeRole,
          },
        },
      });

      if (error) {
        let msg = error.message;
        if (error.message.includes('User already registered')) {
          msg = 'এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে। লগইন করার চেষ্টা করুন।';
        }
        return { error: msg };
      }

      if (data.user) {
        localStorage.removeItem('tolet_demo_role');
        // If session was returned immediately (auto-confirm)
        if (data.session) {
          await fetchProfile(data.user.id);
        }
        return {
          message: 'সফলভাবে অ্যাকাউন্ট তৈরি সম্পন্ন হয়েছে!',
        };
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Sign up failed' };
    }
  };

  const updateProfile = async (updates: {
    name?: string;
    phone?: string;
    whatsapp_number?: string;
    avatar_url?: string;
  }) => {
    if (profile) {
      // Local state update
      const newProfile: UserProfile = {
        ...profile,
        ...updates,
      };
      setProfile(newProfile);
      try {
        localStorage.setItem('tolet_active_profile', JSON.stringify(newProfile));
      } catch (e) {
        console.error(e);
      }
    }

    const client = getSupabaseBrowserClient();
    if (client && user) {
      try {
        const { error } = await client
          .from('profiles')
          .update({
            name: updates.name,
            phone: updates.phone,
            whatsapp_number: updates.whatsapp_number,
            avatar_url: updates.avatar_url,
          })
          .eq('id', user.id);

        if (error) return { error: error.message };
      } catch (err: any) {
        return { error: err.message || 'Failed to update profile' };
      }
    }

    return {};
  };

  const signOut = async () => {
    const client = getSupabaseBrowserClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.error('Sign out error:', e);
      }
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    localStorage.removeItem('tolet_active_profile');
    localStorage.removeItem('tolet_demo_role');
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Demo user helper to test Owner, Tenant and Admin workflows easily
  const setDemoUser = (role: UserRole) => {
    const demo = DEMO_PROFILES[role];
    setProfile(demo);
    localStorage.setItem('tolet_demo_role', role);
    localStorage.setItem('tolet_active_profile', JSON.stringify(demo));
  };

  const isAuthenticated = !!user || !!profile;
  const isOwner = profile?.role === 'owner';
  const isTenant = profile?.role === 'tenant';
  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isConfigured,
        isAuthenticated,
        isOwner,
        isTenant,
        isAdmin,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshProfile,
        updateProfile,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
