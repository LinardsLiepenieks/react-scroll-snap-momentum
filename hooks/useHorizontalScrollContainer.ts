import {
  useRef,
  useState,
  useCallback,
  useEffect,
  RefObject,
  MutableRefObject,
} from 'react';
import { useTouchpadDetection } from './useTouchpadDetection';
import { useScrollThrottle } from './useScrollThrottle';

interface UseHorizontalScrollContainerProps {
  /**
   * Total number of items in the horizontal scroll container
   */
  totalItems: number;

  /**
   * Optional callback fired when the active item changes
   * Use this for carousel indicators, analytics, etc.
   */
  updateActiveItem?: (itemIndex: number) => void;
}

interface UseHorizontalScrollContainerReturn {
  /**
   * Current active item index (0-based)
   */
  currentItem: number;

  /**
   * Ref to attach to the scroll container element
   */
  containerRef: RefObject<HTMLDivElement>;

  /**
   * Ref array to attach to each item element
   */
  itemRefs: MutableRefObject<(HTMLDivElement | null)[]>;

  /**
   * Programmatically scroll to a specific item
   */
  scrollToItem: (itemIndex: number) => void;

  /**
   * Change item with custom scroll behavior
   */
  handleItemChange: (
    itemIndex: number,
    behavior?: 'smooth' | 'instant'
  ) => void;
}

/**
 * Hook for horizontal scroll-snap containers with momentum detection
 *
 * Perfect for:
 * - Image carousels
 * - Product galleries
 * - Story/slide viewers
 * - Horizontal navigation
 *
 * Features:
 * - Horizontal wheel scrolling (including Shift+Wheel)
 * - Horizontal touch swipes (mobile)
 * - Mac trackpad momentum detection
 * - Adaptive throttling
 *
 * @example
 * ```tsx
 * function Carousel() {
 *   const items = ['Image 1', 'Image 2', 'Image 3'];
 *
 *   const { currentItem, containerRef, itemRefs, scrollToItem } =
 *     useHorizontalScrollContainer({
 *       totalItems: items.length,
 *       updateActiveItem: (index) => {
 *         console.log('Viewing item:', index);
 *       }
 *     });
 *
 *   return (
 *     <div ref={containerRef} className="flex overflow-x-scroll snap-x">
 *       {items.map((item, i) => (
 *         <div
 *           key={item}
 *           ref={el => itemRefs.current[i] = el}
 *           className="min-w-full snap-center"
 *         >
 *           {item}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const useHorizontalScrollContainer = ({
  totalItems,
  updateActiveItem,
}: UseHorizontalScrollContainerProps): UseHorizontalScrollContainerReturn => {
  const [currentItem, setCurrentItem] = useState(0);
  const isScrollingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Touch tracking
  const touchStartXRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const isTouchingRef = useRef(false);

  // Use the existing hooks (same configuration as vertical)
  const { detectInertia, isValidDelta } = useTouchpadDetection({
    minTimeGap: 1500, // Based on typical Mac trackpad momentum duration
    minDelta: 4, // Filters out trackpad noise/micro-movements
    debug: false, // Set to true for development debugging
  });

  const { isThrottled, updateThrottle, getThrottleStatus } = useScrollThrottle({
    normalThrottle: 600, // Responsive for intentional scrolls
    momentumThrottle: 1800, // Covers full momentum cascade (~2-3s)
    debug: false, // Set to true for development debugging
  });

  // Touch gesture constants
  const MIN_TOUCH_DISTANCE = 50; // Minimum swipe distance (px)
  const MAX_TOUCH_TIME = 800; // Maximum swipe duration (ms)

  const scrollToItem = useCallback(
    (itemIndex: number) => {
      const targetElement = itemRefs.current[itemIndex];
      if (targetElement) {
        isScrollingRef.current = true;
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
        setCurrentItem(itemIndex);
        updateActiveItem?.(itemIndex);
        updateThrottle(); // Update throttle when scrolling
      }
    },
    [updateActiveItem, updateThrottle]
  );

  const handleItemChange = useCallback(
    (itemIndex: number, behavior: 'smooth' | 'instant' = 'smooth') => {
      const targetElement = itemRefs.current[itemIndex];
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior,
          block: 'nearest',
          inline: 'center',
        });
        setCurrentItem(itemIndex);
      }
    },
    []
  );

  // Intersection Observer: Detect when item is in view
  // Resets isScrolling flag when animation completes
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            // Only reset the scrolling flag, let throttle expire naturally
            isScrollingRef.current = false;
          }
        });
      },
      {
        threshold: 0.5,
        root: containerRef.current,
      }
    );

    itemRefs.current.forEach((item) => {
      if (item) observer.observe(item);
    });

    return () => observer.disconnect();
  }, [totalItems]);

  // Wheel event handler - horizontal scrolling
  // Handles both native horizontal scroll and Shift+Wheel for horizontal movement
  useEffect(() => {
    const throttledWheelHandler = (e: WheelEvent) => {
      // Only handle horizontal scroll or shift+wheel for horizontal movement
      const deltaX = e.deltaX !== 0 ? e.deltaX : e.shiftKey ? e.deltaY : 0;

      if (deltaX === 0) return; // No horizontal movement

      e.preventDefault();

      // Create a mock event for the existing detectInertia function
      // (detectInertia expects deltaY, so we pass deltaX as deltaY)
      const mockEvent = { ...e, deltaY: deltaX };
      const isMomentumScroll = detectInertia(mockEvent);
      const throttleStatus = getThrottleStatus(isMomentumScroll);

      // Filter out very small delta values (trackpad noise)
      if (!isValidDelta(deltaX)) {
        return;
      }

      // Ignore if currently animating a scroll
      if (isScrollingRef.current) {
        return;
      }

      // Check adaptive throttle (600ms normal, 1800ms momentum)
      if (isThrottled(isMomentumScroll)) {
        return;
      }

      // Determine scroll direction and next item
      const direction = deltaX > 0 ? 1 : -1;
      const nextItem = currentItem + direction;

      // Check bounds before scrolling
      if (nextItem >= 0 && nextItem < totalItems) {
        scrollToItem(nextItem);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', throttledWheelHandler, {
        passive: false,
      });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', throttledWheelHandler);
      }
    };
  }, [
    currentItem,
    totalItems,
    scrollToItem,
    detectInertia,
    isValidDelta,
    isThrottled,
    getThrottleStatus,
  ]);

  // Touch event handlers - horizontal swipe gestures
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (isScrollingRef.current) {
        return;
      }

      const touch = e.touches[0];
      touchStartXRef.current = touch.clientX;
      touchStartTimeRef.current = Date.now();
      isTouchingRef.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default scrolling behavior during touch
      if (isTouchingRef.current) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isTouchingRef.current) {
        return;
      }

      const touch = e.changedTouches[0];
      const touchEndX = touch.clientX;
      const touchEndTime = Date.now();

      const deltaX = touchStartXRef.current - touchEndX;
      const deltaTime = touchEndTime - touchStartTimeRef.current;
      const distance = Math.abs(deltaX);

      isTouchingRef.current = false;

      // Validate swipe gesture
      if (distance < MIN_TOUCH_DISTANCE) {
        return; // Swipe too short
      }

      if (deltaTime > MAX_TOUCH_TIME) {
        return; // Swipe too slow
      }

      // Check throttle (use normal throttle for touch events)
      if (isThrottled(false)) {
        return;
      }

      // Determine direction (positive deltaX = swipe left = go to next item)
      const direction = deltaX > 0 ? 1 : -1;
      const nextItem = currentItem + direction;

      // Check bounds before scrolling
      if (nextItem >= 0 && nextItem < totalItems) {
        scrollToItem(nextItem);
      }
    };

    const handleTouchCancel = () => {
      isTouchingRef.current = false;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, {
        passive: true,
      });
      container.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
      container.addEventListener('touchcancel', handleTouchCancel, {
        passive: true,
      });
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('touchcancel', handleTouchCancel);
      }
    };
  }, [currentItem, totalItems, scrollToItem, isThrottled]);

  return {
    currentItem,
    containerRef,
    itemRefs,
    scrollToItem,
    handleItemChange,
  };
};
