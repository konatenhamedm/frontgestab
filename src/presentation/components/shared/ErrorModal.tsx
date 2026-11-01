"use client";

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Error severity type
export type ErrorSeverity = 'error' | 'warning' | 'info' | 'success';

// ErrorModal props interface
export interface ErrorModalProps {
  isOpen: boolean;
  errors: string[];
  severity: ErrorSeverity;
  onClose: () => void;
}

// Severity configuration
const severityConfig = {
  error: {
    icon: AlertCircle,
    gradient: 'bg-gradient-to-r from-red-500 to-red-600',
    iconColor: 'text-red-500',
    title: 'Erreur',
  },
  warning: {
    icon: AlertTriangle,
    gradient: 'bg-gradient-to-r from-orange-500 to-orange-600',
    iconColor: 'text-orange-500',
    title: 'Attention',
  },
  info: {
    icon: Info,
    gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
    iconColor: 'text-blue-500',
    title: 'Information',
  },
  success: {
    icon: CheckCircle,
    gradient: 'bg-gradient-to-r from-green-500 to-green-600',
    iconColor: 'text-green-500',
    title: 'Succès',
  },
};

/**
 * ErrorModal Component
 * 
 * Displays API errors in a beautiful, user-friendly modal dialog.
 * Extends the existing Modal component with error-specific styling and behavior.
 * 
 * Features:
 * - Single or multiple error display
 * - Severity-based styling (error/warning/info)
 * - Close button, backdrop click, and Escape key dismissal
 * - Mobile-responsive (320px minimum width)
 * - Accessible with keyboard navigation
 * 
 * @param isOpen - Whether the modal is visible
 * @param errors - Array of error messages to display
 * @param severity - Error severity level (error, warning, info)
 * @param onClose - Callback function when modal is dismissed
 */
export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  errors,
  severity,
  onClose,
}) => {
  const config = severityConfig[severity];
  const Icon = config.icon;
  const isSingleError = errors.length === 1;

  // Note: Escape key handling is managed by the underlying Dialog component
  // No need for custom Escape key handler

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm",
            "flex-shrink-0"
          )}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="text-base sm:text-lg font-bold">{config.title}</span>
        </div>
      }
      size="md"
      variant="gradient"
    >
      {/* Error content */}
      <div className="space-y-4">
        {isSingleError ? (
          // Single error display
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconColor)} />
            <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
              {errors[0]}
            </p>
          </div>
        ) : (
          // Multiple errors display as styled list
          <div className="space-y-3">
            <p className="text-sm text-gray-600 font-medium">
              Les erreurs suivantes se sont produites :
            </p>
            <ul className="space-y-2">
              {errors.map((error, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <Icon className={cn("w-4 h-4 flex-shrink-0 mt-0.5", config.iconColor)} />
                  <span className="text-sm text-gray-800 leading-relaxed flex-1">
                    {error}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Close button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm",
              "bg-gradient-to-r from-[#ff4a0a] to-[#8FB0A0]",
              "hover:from-[#8FB0A0] hover:to-[#D4AF37]",
              "text-white shadow-lg shadow-[#ff4a0a]/30",
              "hover:shadow-[#8FB0A0]/50",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-[#ff4a0a] focus:ring-offset-2",
              // Mobile optimization - minimum 44px touch target
              "min-h-[44px] min-w-[44px]"
            )}
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
            <span>Fermer</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
