/**
 * WEARABLE OAUTH CALLBACK PAGE
 * Handles OAuth callback from wearable providers
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useWearables } from '@/hooks/useWearables';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function WearablesCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback } = useWearables();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setStatus('error');
      setError(errorParam);
      return;
    }

    if (code && state) {
      handleOAuthCallback.mutate(
        { code, state },
        {
          onSuccess: () => {
            setStatus('success');
            setTimeout(() => navigate('/wearables'), 2000);
          },
          onError: (err) => {
            setStatus('error');
            setError(err.message);
          },
        }
      );
    } else {
      setStatus('error');
      setError('Missing authorization code');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
              <h2 className="text-xl font-semibold mb-2">Connecting Wearable</h2>
              <p className="text-muted-foreground">
                Please wait while we complete the connection...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
              <h2 className="text-xl font-semibold mb-2">Connected Successfully!</h2>
              <p className="text-muted-foreground mb-4">
                Your wearable device has been connected. Redirecting...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-semibold mb-2">Connection Failed</h2>
              <p className="text-muted-foreground mb-4">
                {error || 'Something went wrong. Please try again.'}
              </p>
              <Button onClick={() => navigate('/wearables')}>
                Back to Wearables
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
