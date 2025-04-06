import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

/**
 * Format the remaining time between now and the end time as "1d 2h 3m" or "3m 45s" when under a minute
 * @param endTimeIso ISO string of the end time
 * @returns Formatted time string or empty string if no end time
 */
export const formatRemainingTime = (endTimeIso: string | null): string => {
  if (!endTimeIso) return '';
  
  const now = new Date();
  const endTime = new Date(endTimeIso);
  
  // If the end time is in the past, return "Complete"
  if (endTime <= now) return 'Complete';
  
  const days = differenceInDays(endTime, now);
  const hoursLeft = differenceInHours(endTime, now) % 24;
  const minutesLeft = differenceInMinutes(endTime, now) % 60;
  const secondsLeft = differenceInSeconds(endTime, now) % 60;
  
  let result = '';
  if (days > 0) result += `${days}d `;
  if (hoursLeft > 0 || days > 0) result += `${hoursLeft}h `;
  
  // Show seconds only when we're in the last minute
  if (days === 0 && hoursLeft === 0 && minutesLeft === 0) {
    result += `${secondsLeft}s`;
  } else {
    result += `${minutesLeft}m`;
    // Show seconds as well when minutes are 0 but we still have hours or days
    if (minutesLeft === 0 && (days > 0 || hoursLeft > 0)) {
      result += ` ${secondsLeft}s`;
    }
  }
  
  return result.trim();
};

/**
 * Calculate an end time from now plus a specified duration
 * @param days Number of days
 * @param hours Number of hours
 * @param minutes Number of minutes
 * @returns ISO string of the calculated end time
 */
export const calculateEndTime = (days: number, hours: number, minutes: number): string => {
  const now = new Date();
  const endTime = new Date(now);
  
  endTime.setDate(endTime.getDate() + days);
  endTime.setHours(endTime.getHours() + hours);
  endTime.setMinutes(endTime.getMinutes() + minutes);
  
  return endTime.toISOString();
};