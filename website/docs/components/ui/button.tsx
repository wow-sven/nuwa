import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', children, asChild = false, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg px-6 py-3";

    const variants = {
      primary: "bg-violet-500 dark:bg-violet-600 text-white hover:bg-violet-700 dark:hover:bg-violet-500 shadow-lg hover:shadow-xl hover:scale-105",
      secondary: "bg-gray-50 dark:bg-zinc-700 text-black dark:text-white border-gray-300 dark:border-zinc-600 shadow-lg hover:shadow-xl hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-zinc-600"
    };

    const {
      onAnimationStart,
      onAnimationEnd,
      onAnimationIteration,
      onDrag,
      onDragEnd,
      onDragStart,
      onTransitionEnd,
      ...htmlProps
    } = props;

    const motionProps = {
      className: cn(baseClasses, variants[variant], className),
      whilehover: { scale: variant === 'primary' ? 1.05 : 1.02 },
      whiletap: { scale: 0.98 }
    };

    if (asChild) {
      return (
        <div {...motionProps}>
          {children}
        </div>
      );
    }

    return (
      <button
        ref={ref}
        {...motionProps}
        {...htmlProps}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };