/**
 * SYNC HISTORY LIST
 * Shows recent sync logs with status and details
 */

import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WearableSyncLog } from '@/hooks/useWearables';
import { DATA_TYPE_LABELS, getProviderName, WearableProvider } from '@/lib/wearableProviders';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface SyncHistoryListProps {
  logs: WearableSyncLog[];
  connections: { id: string; provider: WearableProvider }[];
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-warning', label: 'Pending' },
  success: { icon: CheckCircle2, color: 'text-success', label: 'Success' },
  failed: { icon: XCircle, color: 'text-destructive', label: 'Failed' },
  partial: { icon: AlertCircle, color: 'text-warning', label: 'Partial' },
};

export function SyncHistoryList({ logs, connections }: SyncHistoryListProps) {
  const getProviderForLog = (connectionId: string): WearableProvider | undefined => {
    return connections.find(c => c.id === connectionId)?.provider;
  };

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sync History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No sync history yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sync History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="divide-y">
            {logs.map((log) => {
              const status = statusConfig[log.status];
              const StatusIcon = status.icon;
              const provider = getProviderForLog(log.connection_id);

              return (
                <div key={log.id} className="flex items-start gap-3 p-4 hover:bg-accent/30 transition-colors">
                  <StatusIcon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', status.color)} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {log.sync_type === 'manual' ? 'Manual Sync' : 'Auto Sync'}
                      </span>
                      {provider && (
                        <Badge variant="outline" className="text-xs">
                          {getProviderName(provider)}
                        </Badge>
                      )}
                      <Badge 
                        variant="secondary" 
                        className={cn('text-xs', status.color)}
                      >
                        {status.label}
                      </Badge>
                    </div>

                    {/* Data types synced */}
                    {log.data_types && log.data_types.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {log.data_types.map((type) => (
                          <span key={type} className="text-xs text-muted-foreground">
                            {DATA_TYPE_LABELS[type]}
                            {log.data_types.indexOf(type) < log.data_types.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Error message */}
                    {log.error_message && (
                      <p className="text-xs text-destructive mt-1">{log.error_message}</p>
                    )}

                    {/* Records synced */}
                    {log.records_synced > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.records_synced} record{log.records_synced !== 1 ? 's' : ''} synced
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(log.started_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
