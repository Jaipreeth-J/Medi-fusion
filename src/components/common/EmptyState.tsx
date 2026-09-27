/**
 * EMPTY STATE
 * Reusable empty-state component for consistent no-data UI across all pages.
 */

import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  onCtaClick,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center px-4', className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">{description}</p>
      {ctaLabel && (
        <div className="mt-5">
          {ctaHref ? (
            <Link to={ctaHref}>
              <Button size="sm">{ctaLabel}</Button>
            </Link>
          ) : (
            <Button size="sm" onClick={onCtaClick}>
              {ctaLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
