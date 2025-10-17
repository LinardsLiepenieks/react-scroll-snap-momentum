import { useRef } from 'react';

interface UseTouchpadDetectionProps {
  /**
   * Minimum time gap between events to consider them separate gestures
   * Default: 1500ms (based on typical Mac trackpad momentum duration)
   */
  minTimeGap?: number;

  /**
   * Minimum deltaY value to process (filters out trackpad noise/micro-movements)
   * Default: 4
   */
  minDelta?: number;

  /**
   * Enable debug logging to console
   * Default: false (should be false in production for performance)
   */
  debug?: boolean;
}

interface TouchpadDetectionReturn {
  /**
   * Detects if a wheel event is momentum/inertia scrolling
   * Returns true if momentum is detected, false for intentional user input
   */
  detectInertia: (e: WheelEvent) => boolean;

  /**
   * Checks if deltaY is above minimum threshold
   * Returns true if delta is valid, false if it's noise
   */
  isValidDelta: (deltaY: number) => boolean;
}

/**
 * Hook for detecting Mac trackpad momentum/inertia scrolling
 *
 * Uses delta pattern analysis to distinguish between:
 * - Intentional user scrolls (deliberate input)
 * - Momentum scrolls (system-generated inertia after swipe)
 *
 * Momentum events have three characteristics:
 * 1. Fast timing: Events fire < minTimeGap apart
 * 2. Same direction: All events scroll the same way
 * 3. Decreasing deltas: Values decay over time (physics simulation)
 *
 * @example
 * ```tsx
 * const { detectInertia, isValidDelta } = useTouchpadDetection({
 *   minTimeGap: 1500,
 *   minDelta: 4,
 *   debug: false
 * });
 *
 * const handleWheel = (e: WheelEvent) => {
 *   if (!isValidDelta(e.deltaY)) return;
 *
 *   const isMomentum = detectInertia(e);
 *   if (isMomentum) {
 *     // Apply longer throttle for momentum
 *   } else {
 *     // Apply normal throttle for intentional scroll
 *   }
 * };
 * ```
 */
export const useTouchpadDetection = ({
  minTimeGap = 1500,
  minDelta = 4,
  debug = false,
}: UseTouchpadDetectionProps = {}): TouchpadDetectionReturn => {
  // Delta pattern analysis tracking
  const lastDeltaRef = useRef(0);
  const lastDirectionRef = useRef(0);
  const lastEventTimeRef = useRef(0);

  const detectInertia = (e: WheelEvent): boolean => {
    const now = Date.now();
    const currentDelta = Math.abs(e.deltaY);
    const currentDirection = Math.sign(e.deltaY);
    const timeSinceLastEvent = now - lastEventTimeRef.current;

    // Delta pattern analysis for momentum detection
    // A scroll is momentum (not intentional) if ALL of these conditions are true:

    // 1. Events are too quick (< minTimeGap) - momentum fires rapidly
    const isTimeTooQuick = timeSinceLastEvent < minTimeGap;

    // 2. Same direction as previous event - momentum continues in same direction
    const isSameDirection =
      lastDirectionRef.current !== 0 &&
      currentDirection === lastDirectionRef.current;

    // 3. Delta not increasing - momentum decays over time (physics simulation)
    // Note: Allow equal values (e.g. 28 → 28) as momentum can plateau briefly
    const isDeltaNotIncreasing = currentDelta <= lastDeltaRef.current;

    // All three must be true for momentum detection
    const isMomentumScroll =
      isTimeTooQuick && isSameDirection && isDeltaNotIncreasing;
    const isIntentionalScroll = !isMomentumScroll;

    // Update tracking values for next event comparison
    lastDeltaRef.current = currentDelta;
    lastDirectionRef.current = currentDirection;
    lastEventTimeRef.current = now;

    if (debug) {
      console.log('🔍 Touchpad Inertia Detection:', {
        deltaY: e.deltaY,
        absDelta: currentDelta,
        minDelta,
        timeSinceLastEvent,
        isTimeTooQuick,
        isSameDirection,
        isDeltaNotIncreasing,
        isIntentionalScroll,
        isMomentumScroll: isMomentumScroll
          ? '🌊 INERTIA DETECTED'
          : '👆 INTENTIONAL',
        conditions: {
          timeTooQuick: isTimeTooQuick,
          sameDirection: isSameDirection,
          deltaNotIncreasing: isDeltaNotIncreasing,
        },
      });
    }

    // Log inertia detection separately for visibility when debugging
    if (debug && isMomentumScroll) {
      console.log('🌊 INERTIA DETECTED - Event will be throttled longer');
    }

    return isMomentumScroll;
  };

  const isValidDelta = (deltaY: number): boolean => {
    const currentDelta = Math.abs(deltaY);
    return currentDelta >= minDelta;
  };

  return {
    detectInertia,
    isValidDelta,
  };
};
