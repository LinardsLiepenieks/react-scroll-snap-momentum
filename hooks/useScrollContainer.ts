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

interface UseScrollContainerProps {
  /**
   * Total number of sections in the scroll container
   */
  totalSections: number;

  /**
   * Callback fired when the active section changes
   * Use this to update URL, analytics, etc.
   */
  updateURL: (sectionIndex: number) => void;
}

interface UseScrollContainerReturn {
  /**
   * Current active section index (0-based)
   */
  currentSection: number;

  /**
   * Ref to attach to the scroll container element
   */
  containerRef: RefObject<HTMLDivElement>;

  /**
   * Ref array to attach to each section element
   */
  sectionRefs: MutableRefObject<(HTMLDivElement | null)[]>;

  /**
   * Programmatically scroll to a specific section
   */
  scrollToSection: (sectionIndex: number) => void;

  /**
   * Handle browser back/forward navigation
   */
  handlePopStateNavigation: (sectionIndex: number) => void;

  /**
   * Change section from URL hash (e.g., initial load or deep link)
   */
  handleURLSectionChange: (
    sectionIndex: number,
    behavior?: 'smooth' | 'instant'
  ) => void;
}

/**
 * Main hook for vertical scroll-snap sections with momentum detection
 *
 * Handles:
 * - Wheel events (mouse + trackpad) with momentum detection
 * - Touch events (mobile swipe gestures)
 * - Browser back/forward navigation
 * - URL hash integration
 * - Adaptive throttling (600ms normal, 1800ms momentum)
 *
 * @example
 * ```tsx
 * function App() {
 *   const sections = ['home', 'about', 'services', 'contact'];
 *
 *   const { currentSection, containerRef, sectionRefs, scrollToSection } =
 *     useScrollContainer({
 *       totalSections: sections.length,
 *       updateURL: (index) => {
 *         window.history.pushState(null, '', `#${sections[index]}`);
 *       }
 *     });
 *
 *   return (
 *     <div ref={containerRef} className="h-screen overflow-y-scroll snap-y">
 *       {sections.map((section, i) => (
 *         <div
 *           key={section}
 *           ref={el => sectionRefs.current[i] = el}
 *           className="h-screen snap-start"
 *         >
 *           {section}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const useScrollContainer = ({
  totalSections,
  updateURL,
}: UseScrollContainerProps): UseScrollContainerReturn => {
  const [currentSection, setCurrentSection] = useState(0);
  const isScrollingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Touch tracking
  const touchStartYRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const isTouchingRef = useRef(false);

  // Use the extracted hooks
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

  const scrollToSection = useCallback(
    (sectionIndex: number) => {
      const targetElement = sectionRefs.current[sectionIndex];
      if (targetElement) {
        isScrollingRef.current = true;
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setCurrentSection(sectionIndex);
        updateURL(sectionIndex);
        updateThrottle(); // Update throttle when scrolling
      }
    },
    [updateURL, updateThrottle]
  );

  const handlePopStateNavigation = useCallback((sectionIndex: number) => {
    const targetElement = sectionRefs.current[sectionIndex];
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentSection(sectionIndex);
    }
  }, []);

  const handleURLSectionChange = useCallback(
    (sectionIndex: number, behavior: 'smooth' | 'instant' = 'smooth') => {
      const targetElement = sectionRefs.current[sectionIndex];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior, block: 'start' });
        setCurrentSection(sectionIndex);
      }
    },
    []
  );

  // Intersection Observer: Detect when section is in view
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
      { threshold: 0.5 }
    );

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [totalSections]);

  // Wheel event handler (mouse + trackpad)
  useEffect(() => {
    const throttledWheelHandler = (e: WheelEvent) => {
      e.preventDefault();

      // Use momentum detection from useTouchpadDetection hook
      const isMomentumScroll = detectInertia(e);
      const throttleStatus = getThrottleStatus(isMomentumScroll);

      // Filter out very small delta values (trackpad noise)
      if (!isValidDelta(e.deltaY)) {
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

      // Determine scroll direction and next section
      const direction = e.deltaY > 0 ? 1 : -1;
      const nextSection = currentSection + direction;

      // Check bounds before scrolling
      if (nextSection >= 0 && nextSection < totalSections) {
        scrollToSection(nextSection);
      }
    };

    window.addEventListener('wheel', throttledWheelHandler, { passive: false });

    return () => {
      window.removeEventListener('wheel', throttledWheelHandler);
    };
  }, [
    currentSection,
    totalSections,
    scrollToSection,
    detectInertia,
    isValidDelta,
    isThrottled,
    getThrottleStatus,
  ]);

  // Touch event handlers (mobile swipe gestures)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (isScrollingRef.current) {
        return;
      }

      const touch = e.touches[0];
      touchStartYRef.current = touch.clientY;
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
      const touchEndY = touch.clientY;
      const touchEndTime = Date.now();

      const deltaY = touchStartYRef.current - touchEndY;
      const deltaTime = touchEndTime - touchStartTimeRef.current;
      const distance = Math.abs(deltaY);

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

      // Determine direction (positive deltaY = swipe up = go to next section)
      const direction = deltaY > 0 ? 1 : -1;
      const nextSection = currentSection + direction;

      // Check bounds before scrolling
      if (nextSection >= 0 && nextSection < totalSections) {
        scrollToSection(nextSection);
      }
    };

    const handleTouchCancel = () => {
      isTouchingRef.current = false;
    };

    // Add touch event listeners
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchCancel, {
      passive: true,
    });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [currentSection, totalSections, scrollToSection, isThrottled]);

  return {
    currentSection,
    containerRef,
    sectionRefs,
    scrollToSection,
    handlePopStateNavigation,
    handleURLSectionChange,
  };
};
