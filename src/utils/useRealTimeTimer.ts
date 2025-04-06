import { useState, useEffect } from 'react';
import { formatRemainingTime } from './timeUtils';

/**
 * A custom hook that provides real-time timer updates for the given end time.
 * @param endTimeIso ISO string of the end time
 * @returns Formatted time string and boolean indicating if timer is complete
 */
export const useRealTimeTimer = (endTimeIso: string | null): [string, boolean] => {
  const [remainingTime, setRemainingTime] = useState<string>(formatRemainingTime(endTimeIso));
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    if (!endTimeIso) {
      setRemainingTime('');
      setIsComplete(false);
      return;
    }

    // Update immediately to ensure the initial state is correct
    const updateRemainingTime = () => {
      const formattedTime = formatRemainingTime(endTimeIso);
      setRemainingTime(formattedTime);
      
      // Check if the timer is complete
      const now = new Date();
      const endTime = new Date(endTimeIso);
      setIsComplete(endTime <= now);
    };

    // Initial update
    updateRemainingTime();

    // Set interval to update every 30 seconds
    const interval = setInterval(updateRemainingTime, 30000);
    
    // Clean up interval on unmount or when endTimeIso changes
    return () => clearInterval(interval);
  }, [endTimeIso]);

  return [remainingTime, isComplete];
};