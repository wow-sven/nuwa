import { useSubscribeOnError } from '@roochnetwork/rooch-sdk-kit'
import { useEffect } from "react";
import toast from 'react-hot-toast';

export function ErrorGuard() {
  const subscribeToError = useSubscribeOnError();

  useEffect(() => {
    const unsubscribe = subscribeToError((error) => {
      // Keep console log for debugging
      console.error('Error occurred:', error);
      // TODO: remove with list filead 
      if (error.code === 2) {
        return
      }

      // Display error toast in bottom-left corner
      toast.error(error.message, {
        position: 'bottom-left',
        duration: 5000, // Auto dismiss after 5 seconds
      });
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToError]);

  // Add toast container to render notifications
  return (
    <>
      <div className="fixed bottom-4 left-4 z-50" /> {/* Toast anchor point */}
    </>
  );
}
