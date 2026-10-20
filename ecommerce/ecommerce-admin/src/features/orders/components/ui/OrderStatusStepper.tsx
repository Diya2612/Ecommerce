import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Package, 
  Truck, 
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getOrderLifecycleStep 
} from '../../constants/lifecycle';

interface OrderStatusStepperProps {
  currentStatus: string;
  orderDate?: string;
  className?: string;
}

/**
 * Maps the internal ORDER_LIFECYCLE_STEPS to the visual design requirement.
 * Internal steps: pending, confirmed, processing, shipped, delivered
 * Visual labels: Draft, Confirmed, Packed, Shipped, Delivered, Completed
 */
const STEPS = [
  { value: 'pending', label: 'Draft', icon: FileText },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { value: 'processing', label: 'Packed', icon: Package },
  { value: 'shipped', label: 'Shipped', icon: Truck },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  { value: 'completed', label: 'Completed', icon: Check },
];

export const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({ 
  currentStatus, 
  orderDate,
  className 
}) => {
  const currentStepIndex = getOrderLifecycleStep(currentStatus);
  
  // Custom logic for "Completed" which might not be an explicit status in lifecycle.ts yet
  // but is standard in the visual design.
  const isCompleted = currentStatus.toLowerCase() === 'completed';
  const effectiveStepIndex = isCompleted ? STEPS.length - 1 : currentStepIndex;

  return (
    <div className={cn("w-full py-6 px-4", className)}>
      <div className="relative flex items-start justify-between w-full mx-auto">
        {STEPS.map((step, index) => {
          const isPast = index < effectiveStepIndex;
          const isCurrent = index === effectiveStepIndex;
          const isFuture = index > effectiveStepIndex;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.value}>
              {/* Step Item */}
              <div className="flex flex-col items-center relative z-10 shrink-0">
                {/* Icon Container */}
                <div className="relative group">
                  <div
                    className={cn(
                      "size-10 sm:size-12 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                      isPast && "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100",
                      isCurrent && "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-110",
                      isFuture && "bg-white border-slate-200 text-slate-400 shadow-sm"
                    )}
                  >
                    <Icon className={cn("size-5 sm:size-6", isCurrent ? "stroke-[2.5]" : "stroke-2")} />
                  </div>
                </div>

                {/* Label */}
                <div className="mt-3 text-center w-max max-w-[80px] sm:max-w-[100px]">
                  <p className={cn(
                    "text-[10px] sm:text-xs font-semibold tracking-tight leading-tight",
                    isPast && "text-slate-900",
                    isCurrent && "text-indigo-600",
                    isFuture && "text-slate-400"
                  )}>
                    {step.label}
                  </p>
                  {index === 0 && orderDate && (
                    <p className="text-[9px] text-slate-500 mt-1 whitespace-nowrap">
                      {new Date(orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
              </div>

              {/* Connecting Line (except for the last item) */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 sm:mx-3 mt-5 sm:mt-6">
                  <div className={cn(
                    "h-full w-full transition-all duration-500 rounded-full",
                    index < effectiveStepIndex ? "bg-emerald-500 text-emerald-500" : "bg-slate-200"
                  )} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
