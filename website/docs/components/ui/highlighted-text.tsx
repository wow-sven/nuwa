import React from 'react';
import { cn } from '@/lib/utils';

interface HighlightedTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'gradient' | 'underline';
}

const HighlightedText = React.forwardRef<HTMLSpanElement, HighlightedTextProps>(
  ({ className, variant = 'gradient', children, ...props }, ref) => {
    const variants = {
      gradient: "text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600",
      underline: "relative text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 after:absolute after:-bottom-2 after:left-0 after:h-1 after:w-full after:bg-gradient-to-r after:from-purple-600 after:to-pink-600 after:rounded-full"
    };

    return (
      <span
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

HighlightedText.displayName = "HighlightedText";

export { HighlightedText };