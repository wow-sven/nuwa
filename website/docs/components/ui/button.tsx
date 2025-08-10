import React from 'react';
import { motion } from 'framer-motion';
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
      primary: "bg-violet-500 text-white hover:bg-violet-700 shadow-lg hover:shadow-xl hover:scale-105",
      secondary: "bg-gray-50 text-black border-gray-300 shadow-lg hover:shadow-xl hover:text-gray-900 hover:bg-gray-100"
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
      whileHover: { scale: variant === 'primary' ? 1.05 : 1.02 },
      whileTap: { scale: 0.98 }
    };

    if (asChild) {
      return (
        <motion.div {...motionProps}>
          {children}
        </motion.div>
      );
    }

    return (
      <motion.button
        ref={ref}
        {...motionProps}
        {...htmlProps}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };