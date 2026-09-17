import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Only log in development to avoid leaking user data in production
const devLog = (...args: unknown[]) => { if (import.meta.env.DEV) console.log(...args); };
const devWarn = (...args: unknown[]) => { if (import.meta.env.DEV) console.warn(...args); };
const devError = (...args: unknown[]) => { if (import.meta.env.DEV) console.error(...args); };

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TIMEOUT_MS = 10000; // 10 seconds max loading

/** Ensure a profile row exists for the user (handles OAuth first-login) */
async function ensureProfileExists(user: User) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      devError('[Auth] Profile check error:', error.message);
      return;
    }

    if (!data) {
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        '';

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ user_id: user.id, full_name: fullName });

      if (insertError && !insertError.message.includes('duplicate')) {
        devError('[Auth] Profile creation error:', insertError.message);
      } else {
        devLog('[Auth] Profile auto-created for user:', user.id);
      }
    }
  } catch (err) {
    devError('[Auth] ensureProfileExists exception:', err);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          devWarn('[Auth] Loading timed out after', AUTH_TIMEOUT_MS, 'ms');
          setError('Authentication timed out. Please refresh the page.');
        }
        return false;
      });
    }, AUTH_TIMEOUT_MS);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        devLog('[Auth] State change:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
        setLoading(false);
        clearTimeout(timeout);

        // Auto-create profile for new OAuth users
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer profile check to avoid blocking auth state
          setTimeout(() => ensureProfileExists(session.user), 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        devError('[Auth] getSession error:', sessionError.message);
        setError(sessionError.message);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      clearTimeout(timeout);
    }).catch((err) => {
      devError('[Auth] getSession exception:', err);
      setError('Failed to initialize authentication.');
      setLoading(false);
      clearTimeout(timeout);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // Auth methods defined inside provider so they close over state
  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName },
        },
      });
      if (error) setError(error.message);
      return { error };
    } catch (err) {
      const e = err as Error;
      setError(e.message);
      return { error: e };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      return { error };
    } catch (err) {
      const e = err as Error;
      setError(e.message);
      return { error: e };
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, error, signUp, signIn, signOut }}>
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
