# Scroll-Snap Library for React

Thanks for downloading! 🎉

Stop fighting Mac trackpad momentum scrolling. This library provides React hooks that handle smooth section-by-section scrolling with intelligent momentum detection.

## What This Solves

Mac trackpads generate 40+ scroll events from a single swipe due to momentum/inertia. This causes custom scroll implementations to skip multiple sections uncontrollably. This library detects momentum using **delta pattern analysis** and applies adaptive throttling to prevent unwanted scrolls.

## Features

✅ **Delta Pattern Analysis** - Distinguishes intentional scrolls from momentum  
✅ **Adaptive Throttling** - 600ms for intentional, 1800ms for momentum  
✅ **Cross-Device Support** - Works with trackpads, mice, and touch  
✅ **TypeScript** - Full type definitions included  
✅ **Composable Hooks** - Use individually or together  
✅ **Zero Dependencies** - Just React

## Quick Start

### Installation

Copy the hooks into your project:

```bash
src/
  hooks/
    useScrollContainer.ts
    useHorizontalScrollContainer.ts
    useTouchpadDetection.ts
    useScrollThrottle.ts
```

### Basic Usage - Vertical Scrolling

```tsx
import { useScrollContainer } from './hooks/useScrollContainer';

function App() {
  const sections = ['Home', 'About', 'Services', 'Contact'];

  const { currentSection, containerRef, sectionRefs } = useScrollContainer({
    totalSections: sections.length,
    updateURL: (index) => {
      // Optional: Update URL hash
      window.history.pushState(null, '', `#${sections[index]}`);
    },
  });

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory"
    >
      {sections.map((section, index) => (
        <div
          key={section}
          ref={(el) => (sectionRefs.current[index] = el)}
          className="h-screen snap-start flex items-center justify-center"
        >
          <h1 className="text-6xl">{section}</h1>
        </div>
      ))}
    </div>
  );
}
```

### Horizontal Scrolling

```tsx
import { useHorizontalScrollContainer } from './hooks/useHorizontalScrollContainer';

function Carousel() {
  const items = ['Slide 1', 'Slide 2', 'Slide 3'];

  const { currentItem, containerRef, itemRefs } = useHorizontalScrollContainer({
    totalItems: items.length,
    updateActiveItem: (index) => {
      console.log('Active item:', index);
    },
  });

  return (
    <div
      ref={containerRef}
      className="flex overflow-x-scroll snap-x snap-mandatory"
    >
      {items.map((item, index) => (
        <div
          key={item}
          ref={(el) => (itemRefs.current[index] = el)}
          className="min-w-full snap-center flex items-center justify-center"
        >
          <h2 className="text-4xl">{item}</h2>
        </div>
      ))}
    </div>
  );
}
```

## How It Works

### The Problem

When you swipe a Mac trackpad, the browser fires scroll events that simulate momentum:

```
User swipes → Event 1: deltaY = 4 (intentional)
           → Event 2: deltaY = 132 (momentum starts)
           → Event 3: deltaY = 96 (decaying)
           → Event 4: deltaY = 69 (still decaying)
           → ... 40+ more events over 2-3 seconds
```

Without detection, each event triggers a section change = chaos.

### The Solution: Delta Pattern Analysis

Momentum events have a distinct signature:

1. **Fast timing** - Events fire < 1500ms apart
2. **Same direction** - All scroll in the same direction
3. **Decreasing deltas** - Values decay over time (physics simulation)

If ALL three conditions are true → it's momentum, apply longer throttle.

### Adaptive Throttling

- **Normal scrolls:** 600ms throttle (responsive)
- **Momentum scrolls:** 1800ms throttle (blocks entire cascade)

## Configuration

### useScrollContainer

```typescript
interface UseScrollContainerProps {
  totalSections: number; // Number of sections
  updateURL: (index: number) => void; // Callback when section changes
}
```

### useTouchpadDetection

```typescript
interface UseTouchpadDetectionProps {
  minTimeGap?: number; // Default: 1500ms
  minDelta?: number; // Default: 4 (filters noise)
  debug?: boolean; // Default: false
}
```

### useScrollThrottle

```typescript
interface UseScrollThrottleProps {
  normalThrottle?: number; // Default: 600ms
  momentumThrottle?: number; // Default: 1800ms
  debug?: boolean; // Default: false
}
```

## Debugging

Enable debug mode to see momentum detection in action:

```typescript
const { detectInertia } = useTouchpadDetection({
  debug: true, // Logs detection details to console
});
```

Console output:

```
🔍 Touchpad Inertia Detection: {
  deltaY: 96,
  timeSinceLastEvent: 13ms,
  isTimeTooQuick: true,
  isSameDirection: true,
  isDeltaNotIncreasing: true,
  isMomentumScroll: "🌊 INERTIA DETECTED"
}
```

## Browser Support

- ✅ Chrome/Edge (all platforms)
- ✅ Firefox (all platforms)
- ✅ Safari (macOS, iOS)
- ✅ Mobile browsers (touch events)

## Important Notes

⚠️ **Before You Use This:** Custom scroll-snapping breaks expected browser behavior and can hurt UX. Only use if you have a strong design/UX reason.

💡 **Container Required:** You need a scrollable container element (can't use window-level scrolling for programmatic control).

🎯 **CSS Required:** Use CSS `scroll-snap-type` for the smooth snap effect. The hooks handle momentum detection, CSS handles the animation.

## Examples

Check the `examples/` folder for:

- `basic-example.tsx` - Simple vertical sections
- `with-routing-example.tsx` - Integrated with React Router

## FAQ

**Q: Why not use CSS scroll-snap alone?**  
A: CSS scroll-snap doesn't prevent Mac trackpad momentum from triggering multiple section changes.

**Q: Can I use this with Next.js/Remix?**  
A: Yes! Just make sure the scroll container is a client component.

**Q: The scrolling feels laggy**  
A: Make sure debug mode is OFF in production. Console logs significantly slow down scroll events.

**Q: Can I change the throttle values?**  
A: Yes, pass custom values to `useScrollThrottle`. Start with 600/1800 and adjust based on your needs.

## Need Help?

- 🐛 **Issues:** [GitHub Issues](https://github.com/LinardsLiepenieks/react-scroll-snap-momentum)
- 💼 **LinkedIn:** [Linards Liepenieks](https://www.linkedin.com/in/linards-liepenieks/)
- 📧 **Email:** linardsliepenieks@gmail.com
- 📝 **Full Story:** [Read the blog post](https://dev.to/linards_liepenieks/building-custom-scroll-snap-sections-a-journey-through-mac-trackpad-hell-1k2k)

**Need help implementing this?** Reach out for a **free 20-minute consultation** to get you started. I'm happy to help with integration, customization, or troubleshooting.

## Updates

⭐ **Star the GitHub repo** to get notified of updates and improvements.

Built after a week of fighting Mac trackpad momentum. Read the full debugging journey in the blog post above.

## License

MIT License - Use freely in personal and commercial projects.

---

Enjoy smooth scrolling! 🚀

_P.S. - If your PM asks for scroll-snapping, show them the blog post first. Maybe they'll reconsider. Probably not. But at least you tried._
