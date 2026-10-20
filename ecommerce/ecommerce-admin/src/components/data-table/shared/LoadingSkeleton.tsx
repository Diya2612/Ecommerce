/**
 * LoadingSkeleton Component
 * Unified skeleton loading states for table components
 */

import { memo } from 'react';
import { SKELETON_DEFAULTS } from '../utils/constants';

export interface TableSkeletonProps {
  /** Number of skeleton rows to display */
  rows?: number;
  /** Number of columns to display */
  columns: number;
}

/**
 * Skeleton rows for desktop table view
 */
const TableSkeletonComponent: React.FC<TableSkeletonProps> = ({
  rows = SKELETON_DEFAULTS.rowCount,
  columns,
}) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={`skeleton-row-${rowIdx}`} className="border-t border-gray-50">
          {Array.from({ length: columns }).map((__, colIdx) => (
            <td key={`skeleton-col-${colIdx}`} className="px-6 py-4">
              <div className="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

// Export memoized version
export const TableSkeleton = memo(TableSkeletonComponent);

TableSkeleton.displayName = 'TableSkeleton';

export interface MobileSkeletonProps {
  /** Number of skeleton cards to display */
  cards?: number;
}

/**
 * Skeleton cards for mobile view
 */
const MobileSkeletonComponent: React.FC<MobileSkeletonProps> = ({
  cards = SKELETON_DEFAULTS.mobileCardCount,
}) => {
  return (
    <>
      {Array.from({ length: cards }).map((_, idx) => (
        <div
          key={`mobile-skeleton-${idx}`}
          className="rounded-2xl border border-gray-100 p-4 bg-white shadow-sm"
        >
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

// Export memoized version
export const MobileSkeleton = memo(MobileSkeletonComponent);

MobileSkeleton.displayName = 'MobileSkeleton';

export interface SkeletonTextProps {
  /** Width of skeleton (CSS value or percentage) */
  width?: string | number;
  /** Height of skeleton (CSS value) */
  height?: string | number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Generic skeleton text element
 */
const SkeletonTextComponent: React.FC<SkeletonTextProps> = ({
  width = '100%',
  height = '12px',
  className = '',
}) => {
  const widthStyle = typeof width === 'number' ? `${width}px` : width;
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`rounded bg-gray-100 animate-pulse ${className}`}
      style={{ width: widthStyle, height: heightStyle }}
    />
  );
};

// Export memoized version
export const SkeletonText = memo(SkeletonTextComponent);

SkeletonText.displayName = 'SkeletonText';

export interface SkeletonCircleProps {
  /** Size of the circle (CSS value) */
  size?: string | number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Circular skeleton (for avatars, icons, etc.)
 */
const SkeletonCircleComponent: React.FC<SkeletonCircleProps> = ({
  size = '48px',
  className = '',
}) => {
  const sizeStyle = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className={`rounded-full bg-gray-100 animate-pulse ${className}`}
      style={{ width: sizeStyle, height: sizeStyle }}
    />
  );
};

// Export memoized version
export const SkeletonCircle = memo(SkeletonCircleComponent);

SkeletonCircle.displayName = 'SkeletonCircle';
