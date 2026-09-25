/**
 * WEARABLE PROVIDER CARD
 * Display card for a wearable provider with connect/disconnect actions
 */

import { motion } from 'framer-motion';
import { Check, Loader2, Unplug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProviderConfig, DATA_TYPE_LABELS, getCurrentPlatform } from '@/lib/wearableProviders';
import { WearableConnection } from '@/hooks/useWearables';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface WearableProviderCardProps {
  provider: ProviderConfig;
  connection?: WearableConnection;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
}

export function WearableProviderCard({
  provider,
  connection,
  isConnecting,
  onConnect,
  onDisconnect,
  onSync,
}: WearableProviderCardProps) {
  const isConnected = !!connection?.is_active;
  const lastSynced = connection?.last_sync_at
    ? formatDistanceToNow(new Date(connection.last_sync_at), { addSuffix: true })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        'relative overflow-hidden transition-all',
        isConnected && 'border-success/50 bg-success/5'
      )}>
        {/* Status indicator */}
        {isConnected && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-success/20 text-success">
              <Check className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Provider icon */}
            <div 
              className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
              style={{ backgroundColor: `${provider.color}20` }}
            >
              {provider.icon}
            </div>

            {/* Provider info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{provider.name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {provider.description}
              </p>

              {/* Supported data types */}
              <div className="flex flex-wrap gap-1 mt-3">
                {provider.supportedDataTypes.slice(0, 4).map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {DATA_TYPE_LABELS[type]}
                  </Badge>
                ))}
                {provider.supportedDataTypes.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{provider.supportedDataTypes.length - 4} more
                  </Badge>
                )}
              </div>

              {/* Last synced info */}
              {lastSynced && (
                <p className="text-xs text-muted-foreground mt-3">
                  Last synced {lastSynced}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            {isConnected ? (
              <>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={onSync}
                >
                  Sync Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDisconnect}
                >
                  <Unplug className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
