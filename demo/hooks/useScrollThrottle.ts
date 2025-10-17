import { useRef } from 'react';

interface UseScrollThrottleProps {
  /**
   * Throttle duration for normal/intentional scrolls
   * Default: 400ms (responsive feel for deliberate user input)
   */
  normalThrottle?: number;

  /**
   * Throttle duration for momentum/inertia scrolls
   * Default: 1800ms (covers full Mac trackpad momentum cascade ~2-3s)
   */
  momentumThrottle?: number;

  /**
   * Enable debug logging to console
   * Default: false (should be false in production for performance)
   */
  debug?: boolean;
}

interface ThrottleStatus {
  /**
   * Whether the throttle is currently active
   */
  isThrottled: boolean;

  /**
   * Time remaining on current throttle (ms)
   */
  remainingTime: number;

  /**
   * The effective throttle duration being used (normal or momentum)
   */
  effectiveThrottle: number;

  /**
   * Time since last throttle was set (ms)
   */
  timeSinceLastThrottle: number;

  /**
   * Type of throttle active: 'momentum' or 'normal'
   */
  throttleType: 'momentum' | 'normal';
}

interface ScrollThrottleReturn {
  /**
   * Check if scrolling is currently throttled
   * @param isMomentumScroll - Whether to use momentum or normal throttle duration
   */
  isThrottled: (isMomentumScroll: boolean) => boolean;

  /**
   * Update the throttle timestamp (call when a scroll action is taken)
   */
  updateThrottle: () => void;

  /**
   * Get detailed throttle status for debugging
   * @param isMomentumScroll - Whether to check against momentum or normal throttle
   */
  getThrottleStatus: (isMomentumScroll: boolean) => ThrottleStatus;

  /**
   * Reset throttle (useful for cleanup or manual reset)
   */
  reset: () => void;
}

/**
 * Hook for adaptive scroll throttling
 *
 * Provides two different throttle durations:
 * - Normal throttle: For intentional user scrolls (responsive)
 * - Momentum throttle: For Mac trackpad momentum events (blocks cascade)
 *
 * This prevents:
 * - Accidental double-scrolls from quick user input
 * - Multiple section changes from trackpad momentum
 *
 * @example
 * ```tsx
 * const { isThrottled, updateThrottle } = useScrollThrottle({
 *   normalThrottle: 600,
 *   momentumThrottle: 1800,
 *   debug: false
 * });
 *
 * const handleScroll = (isMomentum: boolean) => {
 *   if (isThrottled(isMomentum)) {
 *     return; // Still throttled, ignore event
 *   }
 *
 *   // Execute scroll action
 *   scrollToNextSection();
 *
 *   // Update throttle after action
 *   updateThrottle();
 * };
 * ```
 */
export const useScrollThrottle = ({
  normalThrottle = 400,
  momentumThrottle = 1800,
  debug = false,
}: UseScrollThrottleProps = {}): ScrollThrottleReturn => {
  const lastThrottleTimeRef = useRef(0);

  const isThrottled = (isMomentumScroll: boolean): boolean => {
    const now = Date.now();
    const effectiveThrottle = isMomentumScroll
      ? momentumThrottle
      : normalThrottle;
    const timeSinceLastThrottle = now - lastThrottleTimeRef.current;
    const throttled = timeSinceLastThrottle < effectiveThrottle;

    if (debug && throttled) {
      console.log('⏳ Scroll Throttled:', {
        isMomentumScroll,
        effectiveThrottle,
        timeSinceLastThrottle,
        throttleType: isMomentumScroll ? 'momentum' : 'normal',
        waitTime: effectiveThrottle - timeSinceLastThrottle,
      });
    }

    return throttled;
  };

  const updateThrottle = (): void => {
    const now = Date.now();
    lastThrottleTimeRef.current = now;

    if (debug) {
      console.log('⏰ Throttle Updated:', {
        timestamp: now,
        nextAvailableTime: now + normalThrottle,
      });
    }
  };

  const getThrottleStatus = (isMomentumScroll: boolean): ThrottleStatus => {
    const now = Date.now();
    const effectiveThrottle = isMomentumScroll
      ? momentumThrottle
      : normalThrottle;
    const timeSinceLastThrottle = now - lastThrottleTimeRef.current;
    const remainingTime = Math.max(
      0,
      effectiveThrottle - timeSinceLastThrottle
    );

    return {
      isThrottled: remainingTime > 0,
      remainingTime,
      effectiveThrottle,
      timeSinceLastThrottle,
      throttleType: isMomentumScroll ? 'momentum' : 'normal',
    };
  };

  const reset = (): void => {
    lastThrottleTimeRef.current = 0;
    if (debug) {
      console.log('🔄 Throttle Reset');
    }
  };

  return {
    isThrottled,
    updateThrottle,
    getThrottleStatus,
    reset,
  };
};
