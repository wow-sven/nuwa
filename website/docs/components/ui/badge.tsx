import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'> {
  children: React.ReactNode;
  variant?: 'live' | 'default';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium";
    
    const variants = {
      live: "bg-violet-500/80 text-white py-1 text-xs rounded-md backdrop-blur-sm",
      default: "bg-gray-100 text-gray-900"
    };

    return (
      <motion.span
        ref={ref}
        className={cn(baseClasses, variants[variant], className)}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {variant === 'live' && (
          <span className="mr-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        )}
        {children}
      </motion.span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };