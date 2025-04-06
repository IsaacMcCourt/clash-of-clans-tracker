import { useState, useEffect } from 'react';
import { formatRemainingTime } from './timeUtils';
import { differenceInMinutes } from 'date-fns';

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
      
      // Check if we're in the last minute and need to update more frequently
      return differenceInMinutes(endTime, now) <= 0;
    };

    // Initial update and check if we need faster updates
    const needsFastUpdates = updateRemainingTime();

    // Set interval with dynamic refresh rate:
    // - 1 second updates when under a minute
    // - 30 second updates when more than a minute remains
    const intervalTime = needsFastUpdates ? 1000 : 30000;
    const interval = setInterval(() => {
      // Check if we need to switch update frequency
      const stillNeedsFastUpdates = updateRemainingTime();
      
      // If update frequency needs to change, clear and reset the interval
      if (needsFastUpdates !== stillNeedsFastUpdates) {
        clearInterval(interval);
        const newIntervalTime = stillNeedsFastUpdates ? 1000 : 30000;
        setInterval(updateRemainingTime, newIntervalTime);
      }
    }, intervalTime);
    
    // Clean up interval on unmount or when endTimeIso changes
    return () => clearInterval(interval);
  }, [endTimeIso]);

  return [remainingTime, isComplete];
};