import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Unlink, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

interface LinkedProvider {
  provider: string;
  linked: boolean;
  email?: string;
}

const PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    ),
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
    ),
  },
];

export function LinkedAccountsCard() {
  const [linkedProviders, setLinkedProviders] = useState<LinkedProvider[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLinkedProviders();
  }, []);

  const fetchLinkedProviders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const identities = user.identities || [];
      
      const providers = PROVIDERS.map((p) => {
        const identity = identities.find((i) => i.provider === p.id);
        return {
          provider: p.id,
          linked: !!identity,
          email: identity?.identity_data?.email,
        };
      });

      setLinkedProviders(providers);
    } catch (error) {
      console.error('Error fetching linked providers:', error);
    }
  };

  const handleLinkProvider = async (provider: 'google' | 'apple') => {
    setLoading(provider);
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin + '/profile',
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to link ${provider}`,
        variant: 'destructive',
      });
      setLoading(null);
    }
  };

  const handleUnlinkProvider = async (provider: string) => {
    setLoading(provider);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const identity = user.identities?.find((i) => i.provider === provider);
      if (!identity) throw new Error('Provider not linked');

      // Check if this is the only authentication method
      const hasPassword = user.identities?.some((i) => i.provider === 'email');
      const linkedCount = user.identities?.length || 0;
      
      if (linkedCount <= 1) {
        throw new Error('Cannot unlink the only authentication method. Add another method first.');
      }

      const { error } = await supabase.auth.unlinkIdentity(identity);
      if (error) throw error;

      toast({
        title: 'Account unlinked',
        description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} account has been unlinked.`,
      });

      await fetchLinkedProviders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to unlink ${provider}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Linked Accounts
        </CardTitle>
        <CardDescription>
          Connect additional sign-in methods to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {PROVIDERS.map((provider) => {
          const linked = linkedProviders.find((p) => p.provider === provider.id);
          const isLinked = linked?.linked;
          const isLoading = loading === provider.id;

          return (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 sm:p-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted sm:h-10 sm:w-10">
                  {provider.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{provider.name}</p>
                  {isLinked && linked?.email && (
                    <p className="text-xs text-muted-foreground truncate max-w-[140px] sm:max-w-none">{linked.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isLinked ? (
                  <>
                    <Badge variant="secondary" className="gap-1 text-[10px] sm:text-xs">
                      <CheckCircle className="h-3 w-3" />
                      Connected
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUnlinkProvider(provider.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="animate-spin text-xs">⏳</span>
                      ) : (
                        <Unlink className="h-4 w-4" />
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLinkProvider(provider.id as 'google' | 'apple')}
                    disabled={isLoading}
                    className="gap-2 text-xs"
                  >
                    {isLoading ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}

        <div className="mt-4 rounded-lg bg-muted/50 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Linking multiple accounts allows you to sign in using any connected method. 
              You can unlink an account as long as you have another way to sign in.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
