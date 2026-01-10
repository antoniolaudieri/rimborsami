import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync new opportunities for user
  const syncNewOpportunities = async (userId: string) => {
    try {
      // Get all active opportunities
      const { data: allOpportunities, error: oppError } = await supabase
        .from('opportunities')
        .select('id')
        .eq('active', true);

      if (oppError || !allOpportunities) return;

      // Get user's existing opportunities
      const { data: userOpps, error: userOppError } = await supabase
        .from('user_opportunities')
        .select('opportunity_id')
        .eq('user_id', userId);

      if (userOppError) return;

      const existingOppIds = new Set(userOpps?.map(uo => uo.opportunity_id) || []);

      // Find new opportunities to add
      const newOpportunities = allOpportunities.filter(opp => !existingOppIds.has(opp.id));

      if (newOpportunities.length > 0) {
        // Insert new user_opportunities
        const { error: insertError } = await supabase
          .from('user_opportunities')
          .insert(
            newOpportunities.map(opp => ({
              user_id: userId,
              opportunity_id: opp.id,
              status: 'found' as const,
              matched_data: { source: 'auto_sync' },
            }))
          );

        if (!insertError) {
          console.log(`Synced ${newOpportunities.length} new opportunities for user`);
          
          // Create notification for new opportunities
          if (newOpportunities.length > 0) {
            await supabase.from('notifications').insert({
              user_id: userId,
              type: 'new_opportunity',
              title: `${newOpportunities.length} nuove opportunità disponibili!`,
              message: `Abbiamo aggiunto ${newOpportunities.length} nuove opportunità di rimborso al tuo account.`,
              action_url: '/dashboard/opportunities',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error syncing opportunities:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);

        // Sync opportunities on sign in
        if (event === 'SIGNED_IN' && currentSession?.user) {
          setTimeout(() => {
            syncNewOpportunities(currentSession.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);

      // Also sync on initial load if user is already logged in
      if (currentSession?.user) {
        setTimeout(() => {
          syncNewOpportunities(currentSession.user.id);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || '',
        }
      }
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
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
