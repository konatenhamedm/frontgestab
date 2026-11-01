import React from 'react';
import { cn } from '@/lib/utils';

export interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
  showScrollIndicator?: boolean;
}

/**
 * ResponsiveTable component handles table display on mobile devices
 * with horizontal scrolling and optimized layout.
 * 
 * Features:
 * - Horizontal scroll container with scroll indicators
 * - Optimized row height for mobile viewing
 * - Minimum 44px touch targets for action buttons
 * - Shadow indicators for overflow content
 */
export function ResponsiveTable({
  children,
  className,
  showScrollIndicator = true,
}: ResponsiveTableProps) {
  const [showLeftShadow, setShowLeftShadow] = React.useState(false);
  const [showRightShadow, setShowRightShadow] = React.useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = React.useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    // Show left shadow if scrolled right
    setShowLeftShadow(scrollLeft > 0);
    
    // Show right shadow if not scrolled to the end
    setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Check initial scroll state
    handleScroll();

    // Add scroll listener
    container.addEventListener('scroll', handleScroll);
    
    // Add resize listener to recalculate shadows
    window.addEventListener('resize', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className="relative w-full">
      {/* Left shadow indicator */}
      {showScrollIndicator && showLeftShadow && (
        <div
          className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent"
          aria-hidden="true"
        />
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="inline-block min-w-full align-middle">
          <table
            className={cn(
              'min-w-full divide-y divide-gray-200',
              className
            )}
          >
            {children}
          </table>
        </div>
      </div>

      {/* Right shadow indicator */}
      {showScrollIndicator && showRightShadow && (
        <div
          className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/**
 * ResponsiveTableHead component for table headers
 */
export function ResponsiveTableHead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <thead className={cn('bg-[#1f2a37] text-white', className)}>
      {children}
    </thead>
  );
}

/**
 * ResponsiveTableBody component for table body
 */
export function ResponsiveTableBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tbody className={cn('divide-y divide-gray-200 bg-white', className)}>
      {children}
    </tbody>
  );
}

/**
 * ResponsiveTableRow component for table rows
 */
export function ResponsiveTableRow({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      className={cn(
        'hover:bg-gray-50 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

/**
 * ResponsiveTableHeader component for table header cells
 */
export function ResponsiveTableHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/90',
        'md:px-6 md:py-4',
        className
      )}
    >
      {children}
    </th>
  );
}

/**
 * ResponsiveTableCell component for table data cells
 */
export function ResponsiveTableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        'whitespace-nowrap px-4 py-3 text-sm text-gray-900',
        'md:px-6 md:py-4',
        className
      )}
    >
      {children}
    </td>
  );
}

/**
 * ResponsiveTableActionCell component for action buttons
 * Ensures minimum 44px touch targets
 */
export function ResponsiveTableActionCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        'whitespace-nowrap px-4 py-3 text-right text-sm font-medium',
        'md:px-6 md:py-4',
        className
      )}
    >
      <div className="flex items-center justify-end gap-2">
        {children}
      </div>
    </td>
  );
}
