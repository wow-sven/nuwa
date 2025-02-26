import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ErrorToastProps {
  message: string;
  onClose: () => void;
  duration?: number; // Auto-hide duration in milliseconds
}

export function ErrorToast({ message, onClose, duration = 5000 }: ErrorToastProps) {
  // Auto-dismiss after duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded shadow-md pr-10 max-w-md animate-fade-in">
      <div className="flex">
        <p>{message}</p>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-red-500 hover:text-red-700"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}