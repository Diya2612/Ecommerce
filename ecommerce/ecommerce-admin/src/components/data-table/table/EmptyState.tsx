/**
 * EmptyState Component
 * Displays empty, loading, or error states for tables
 */

import { memo } from 'react';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  /** Number of columns (for colspan) */
  colSpan: number;
  /** Message or component to display */
  children?: ReactNode;
  /** Default message if no children provided */
  message?: string;
}

/**
 * Empty state row for table
 */
const EmptyStateComponent: React.FC<EmptyStateProps> = ({
  colSpan,
  children,
  message = 'No records found.',
}) => {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-6 py-8 text-center text-gray-400 text-sm"
      >
        {children ?? message}
      </td>
    </tr>
  );
};

// Export memoized version
export const EmptyState = memo(EmptyStateComponent);

EmptyState.displayName = 'EmptyState';
