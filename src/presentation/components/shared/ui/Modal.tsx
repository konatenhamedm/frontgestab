// components/ui/Modal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AnimatedModalBody } from "./AnimatedModalBody";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | ReactNode;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  footer?: ReactNode;
  variant?: "default" | "gradient" | "light" | "danger";
  showCloseButton?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  footer,
  variant = "default",
  showCloseButton = true,
}: ModalProps) => {
  const sizeClasses = {
    sm: "sm:max-w-[425px]",
    md: "sm:max-w-[550px]",
    lg: "sm:max-w-[750px]",
    xl: "sm:max-w-[950px]",
    "2xl": "sm:max-w-[1150px] w-full",
    "3xl": "sm:max-w-[1350px] w-[95vw]",
    "4xl": "sm:max-w-[1550px] w-[97vw]",
    full: "!max-w-[98vw] w-[98vw] !h-[94vh] max-h-[94vh]",
  };

  // Couleur unique pour tous les headers — #ff4a0a (Orange ateliya)
  const headerVariants = {
    default: "bg-[#1f2a37] text-white",
    gradient: "bg-[#1f2a37] text-white",
    light: "bg-[#1f2a37] text-white",
    danger: "bg-red-600 text-white",
  };

  const descriptionVariants = {
    default: "text-white/75",
    gradient: "text-white/75",
    light: "text-white/75",
    danger: "text-white/75",
  };

  const closeButtonVariants = {
    default: "[&>button]:text-white [&>button]:hover:text-white/80 [&>button]:hover:bg-white/20",
    gradient: "[&>button]:text-white [&>button]:hover:text-white/80 [&>button]:hover:bg-white/20",
    light: "[&>button]:text-white [&>button]:hover:text-white/80 [&>button]:hover:bg-white/20",
    danger: "[&>button]:text-white [&>button]:hover:text-white/80 [&>button]:hover:bg-white/20",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn(
          sizeClasses[size],
          "flex flex-col p-0 bg-white",
          size === "full" ? "max-h-[95vh] h-[95vh]" : "max-h-[90vh] sm:max-h-[85vh]",
          "border border-slate-200 shadow-2xl shadow-[#ff4a0a]/10",
          closeButtonVariants[variant],
          "z-[120]",
          "data-[state=open]:z-[120]"
        )}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header — couleur unique #ff4a0a */}
        <div className={cn(
          "rounded-t-lg px-5 py-4 flex-shrink-0",
          headerVariants[variant]
        )}>
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold text-white">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className={cn(
                "text-sm mt-1",
                descriptionVariants[variant]
              )}>
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        {/* Body - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto overflow-x-visible px-5 py-6 bg-white" style={{ overflowX: 'visible' }}>
          <div className="space-y-4">
            <AnimatedModalBody stagger={true}>
              {children}
            </AnimatedModalBody>
          </div>
        </div>

        {/* Trait séparateur avant le footer */}
        {footer && (
          <div className="h-px bg-slate-100 flex-shrink-0" />
        )}

        {/* Footer */}
        {footer && (
          <div className="bg-slate-50 px-5 py-4 rounded-b-lg flex-shrink-0 border-t border-slate-100">
            <DialogFooter>{footer}</DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Composant ModalFooterButtons pré-stylisé pour les boutons
export const ModalFooterButtons = ({
  onCancel,
  onConfirm,
  cancelText = "Annuler",
  confirmText = "Confirmer",
  isLoading = false,
  confirmVariant = "default",
  confirmClassName = "",
}: {
  onCancel?: () => void;
  onConfirm?: () => void | Promise<void>;
  cancelText?: string;
  confirmText?: string;
  isLoading?: boolean;
  confirmVariant?: "default" | "destructive";
  confirmClassName?: string;
}) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-bold h-10 px-6 rounded-lg"
        >
          {cancelText}
        </Button>
      )}
      {onConfirm && (
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          variant={confirmVariant}
          className={cn(
            "shadow-md transition-all font-bold h-10 px-8 rounded-lg",
            confirmVariant === "default" && !confirmClassName &&
            "bg-[#1f2a37] hover:bg-[#2b3949] text-white shadow-[#ff4a0a]/20",
            confirmClassName
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {confirmText}
            </span>
          ) : (
            confirmText
          )}
        </Button>
      )}
    </div>
  );
};