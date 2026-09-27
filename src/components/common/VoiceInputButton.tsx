/**
 * VOICE INPUT BUTTON
 * Reusable microphone button component for voice input
 */

import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VoiceInputButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  showTooltip?: boolean;
  disabled?: boolean;
}

export function VoiceInputButton({
  isListening,
  isSupported,
  onClick,
  className,
  size = 'icon',
  variant = 'outline',
  showTooltip = true,
  disabled = false,
}: VoiceInputButtonProps) {
  if (!isSupported) {
    return null;
  }

  const button = (
    <Button
      type="button"
      variant={isListening ? 'destructive' : variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative transition-all',
        isListening && 'animate-pulse',
        className
      )}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
    >
      {isListening ? (
        <>
          <span className="absolute inset-0 animate-ping rounded-full bg-destructive/30" />
          <MicOff className="h-4 w-4 relative z-10" />
        </>
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );

  if (!showTooltip) {
    return button;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          <p>{isListening ? 'Stop listening' : 'Voice input'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
