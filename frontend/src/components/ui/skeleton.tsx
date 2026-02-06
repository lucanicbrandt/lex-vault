/**
 * Skeleton Loading Component
 * 
 * Displays placeholder loading states for content.
 * Uses CSS animations for a smooth shimmer effect.
 */

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width of the skeleton (CSS value or Tailwind class) */
  width?: string;
  /** Height of the skeleton (CSS value or Tailwind class) */
  height?: string;
}

/**
 * Base skeleton component with shimmer animation.
 */
function Skeleton({
  className,
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
}

/**
 * Skeleton for text content with multiple lines.
 */
function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            // Last line is shorter for natural look
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for search result cards.
 */
function SkeletonResultCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4',
        className
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      
      {/* Snippet */}
      <div className="mb-3 rounded-md bg-muted/50 p-3">
        <SkeletonText lines={3} />
      </div>
      
      {/* Metadata */}
      <div className="mb-3 flex items-center gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      
      {/* Tags */}
      <div className="mb-3 flex gap-1.5">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-end gap-2 border-t pt-3">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-36" />
      </div>
    </div>
  );
}

/**
 * Skeleton for search results list.
 */
function SkeletonResultsList({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Results header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-4 w-16" />
      </div>
      
      {/* Result cards */}
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonResultCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for the search bar area.
 */
function SkeletonSearchBar({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonResultCard,
  SkeletonResultsList,
  SkeletonSearchBar,
};
