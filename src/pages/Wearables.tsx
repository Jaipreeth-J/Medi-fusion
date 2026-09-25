/**
 * WEARABLES PAGE
 * Main page for managing wearable device connections and syncing health data
 */

import { useState } from 'react';
import { Watch, Settings, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { WearableProviderCard } from '@/components/wearables/WearableProviderCard';
import { SyncDataDialog } from '@/components/wearables/SyncDataDialog';
import { SyncedVitalsDisplay } from '@/components/wearables/SyncedVitalsDisplay';
import { SyncHistoryList } from '@/components/wearables/SyncHistoryList';
import { useWearables, WearableConnection } from '@/hooks/useWearables';
import { getAvailableProviders, getCurrentPlatform, DataType, WearableProvider } from '@/lib/wearableProviders';

function WearablesSkeleton() {
  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function Wearables() {
  const {
    connections, syncLogs, isLoading, connectionsError, latestVitals,
    connectWearable, disconnectWearable, syncWearable, getConnectionByProvider,
  } = useWearables();

  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<WearableConnection | null>(null);
  const [connectingProvider, setConnectingProvider] = useState<WearableProvider | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const platform = getCurrentPlatform();
  const availableProviders = getAvailableProviders();
  const activeConnections = connections.filter(c => c.is_active);

  const handleConnect = async (provider: WearableProvider) => {
    setConnectingProvider(provider);
    try {
      await connectWearable.mutateAsync(provider);
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    await disconnectWearable.mutateAsync(connectionId);
  };

  const handleOpenSyncDialog = (connection: WearableConnection) => {
    setSelectedConnection(connection);
    setSyncDialogOpen(true);
  };

  const handleSync = async (dataTypes: DataType[], symptoms?: string) => {
    if (!selectedConnection) return;
    try {
      await syncWearable.mutateAsync({
        connectionId: selectedConnection.id,
        dataTypes,
        symptoms,
      });
    } finally {
      setSyncDialogOpen(false);
    }
  };

  const handleSyncAll = async () => {
    if (activeConnections.length === 0) return;
    setIsSyncingAll(true);
    try {
      for (const conn of activeConnections) {
        const defaultTypes: DataType[] = ['heart_rate', 'spo2', 'steps', 'calories', 'sleep'];
        await syncWearable.mutateAsync({
          connectionId: conn.id,
          dataTypes: defaultTypes,
        });
      }
    } finally {
      setIsSyncingAll(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl px-4 py-5 space-y-6 sm:px-6 sm:py-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Watch className="h-6 w-6 text-primary" />
              Wearable Sync
            </h1>
            <p className="text-muted-foreground">
              Connect your smartwatch and fitness trackers to sync health data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs capitalize">{platform}</Badge>
            {activeConnections.length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleSyncAll}
                disabled={isSyncingAll || syncWearable.isPending}
              >
                {isSyncingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync All
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </motion.div>

        {/* Error state */}
        {connectionsError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load wearable connections. Please check your connection and try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading skeleton */}
        {isLoading ? (
          <WearablesSkeleton />
        ) : (
          <>
            {/* Synced Vitals Overview */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <SyncedVitalsDisplay vitals={latestVitals} isLoading={syncWearable.isPending || isSyncingAll} />
            </motion.div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="devices" className="space-y-6">
              <TabsList>
                <TabsTrigger value="devices">Devices</TabsTrigger>
                <TabsTrigger value="history">Sync History</TabsTrigger>
              </TabsList>

              <TabsContent value="devices" className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {availableProviders.map((provider) => {
                    const connection = getConnectionByProvider(provider.id);
                    return (
                      <WearableProviderCard
                        key={provider.id}
                        provider={provider}
                        connection={connection}
                        isConnecting={connectingProvider === provider.id}
                        onConnect={() => handleConnect(provider.id)}
                        onDisconnect={() => connection && handleDisconnect(connection.id)}
                        onSync={() => connection && handleOpenSyncDialog(connection)}
                      />
                    );
                  })}
                </div>

                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="rounded-lg border bg-muted/30 p-4"
                >
                  <h3 className="font-medium mb-2">💡 Quick Tips</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Google Fit:</strong> Works with Amazfit, Wear OS, and most Android watches</li>
                    <li>• <strong>Fitbit:</strong> Connect directly to sync from Fitbit devices</li>
                    <li>• <strong>Garmin:</strong> Syncs from Garmin Connect for all Garmin watches</li>
                    {platform === 'android' && (
                      <li>• <strong>Health Connect:</strong> Android 13+ native health data aggregator</li>
                    )}
                    {platform === 'ios' && (
                      <li>• <strong>Apple Watch:</strong> Syncs via HealthKit on iOS devices</li>
                    )}
                  </ul>
                </motion.div>
              </TabsContent>

              <TabsContent value="history">
                <SyncHistoryList
                  logs={syncLogs}
                  connections={connections.map(c => ({ id: c.id, provider: c.provider }))}
                />
              </TabsContent>
            </Tabs>
          </>
        )}

        <SyncDataDialog
          open={syncDialogOpen}
          onOpenChange={setSyncDialogOpen}
          connection={selectedConnection}
          onSync={handleSync}
          isSyncing={syncWearable.isPending}
        />
      </div>
    </AppLayout>
  );
}
