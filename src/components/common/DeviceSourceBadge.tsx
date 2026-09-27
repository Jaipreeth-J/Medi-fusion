/**
 * DEVICE SOURCE BADGE
 * Displays device source attribution with hover/tap to show full sync chain
 */

import { useState } from 'react';
import { Smartphone, Watch, Activity } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface DeviceSourceInfo {
  device_name: string | null;
  device_type: string | null;
  source_app: string | null;
  health_platform: string | null;
  sync_source_chain: { chain: string[] } | null;
}

interface DeviceSourceBadgeProps {
  source: DeviceSourceInfo;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

const DEVICE_TYPE_ICONS: Record<string, React.ReactNode> = {
  watch: <Watch className="h-3 w-3" />,
  band: <Activity className="h-3 w-3" />,
  phone: <Smartphone className="h-3 w-3" />,
  scale: <Activity className="h-3 w-3" />,
};

function getDisplayName(source: DeviceSourceInfo): string {
  // Priority: device_name > source_app > health_platform > 'Unknown'
  if (source.device_name) return source.device_name;
  if (source.source_app) return source.source_app;
  if (source.health_platform) return source.health_platform;
  return 'Manual Entry';
}

function getSyncChain(source: DeviceSourceInfo): string[] {
  // If we have a stored chain, use it
  if (source.sync_source_chain?.chain?.length) {
    return source.sync_source_chain.chain;
  }
  
  // Build chain from available data
  const chain: string[] = [];
  if (source.device_name) chain.push(source.device_name);
  if (source.source_app && source.source_app !== source.device_name) {
    chain.push(source.source_app);
  }
  if (source.health_platform && source.health_platform !== source.source_app) {
    chain.push(source.health_platform);
  }
  chain.push('MediFusion');
  
  return chain.length > 1 ? chain : ['Manual Entry', 'MediFusion'];
}

function getDeviceIcon(deviceType: string | null): React.ReactNode {
  if (!deviceType) return <Activity className="h-3 w-3" />;
  return DEVICE_TYPE_ICONS[deviceType.toLowerCase()] || <Activity className="h-3 w-3" />;
}

export function DeviceSourceBadge({ source, variant = 'default', className }: DeviceSourceBadgeProps) {
  const displayName = getDisplayName(source);
  const syncChain = getSyncChain(source);
  const icon = getDeviceIcon(source.device_type);
  
  const chainDisplay = syncChain.join(' → ');
  
  // For inline variant, just show the text
  if (variant === 'inline') {
    return (
      <span className={cn('text-xs text-muted-foreground', className)}>
        Synced from {displayName}
      </span>
    );
  }
  
  // For compact variant, use tooltip
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                'cursor-help gap-1 text-xs font-normal',
                className
              )}
            >
              {icon}
              <span className="max-w-[100px] truncate">{displayName}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium text-xs">Sync Chain</p>
              <p className="text-xs text-muted-foreground">{chainDisplay}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Default variant with hover card
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <Badge 
          variant="secondary" 
          className={cn(
            'cursor-help gap-1.5 transition-colors hover:bg-secondary/80',
            className
          )}
        >
          {icon}
          <span>Synced from {displayName}</span>
        </Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto max-w-sm" align="start">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium">Data Source</span>
          </div>
          
          {/* Sync Chain Visualization */}
          <div className="flex flex-wrap items-center gap-1 text-sm">
            {syncChain.map((step, index) => (
              <span key={index} className="flex items-center">
                <span className={cn(
                  'px-2 py-0.5 rounded-md',
                  index === syncChain.length - 1 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'bg-muted text-muted-foreground'
                )}>
                  {step}
                </span>
                {index < syncChain.length - 1 && (
                  <span className="mx-1 text-muted-foreground">→</span>
                )}
              </span>
            ))}
          </div>
          
          {/* Device Details */}
          {(source.device_type || source.source_app) && (
            <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
              {source.device_type && (
                <p>Device Type: <span className="capitalize">{source.device_type}</span></p>
              )}
              {source.source_app && (
                <p>Source App: {source.source_app}</p>
              )}
              {source.health_platform && (
                <p>Platform: {source.health_platform}</p>
              )}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

/**
 * Simple text component for showing source in lists
 */
export function DeviceSourceText({ source }: { source: DeviceSourceInfo }) {
  const displayName = getDisplayName(source);
  const syncChain = getSyncChain(source);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-xs text-muted-foreground cursor-help underline-offset-2 hover:underline">
            from {displayName}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{syncChain.join(' → ')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
