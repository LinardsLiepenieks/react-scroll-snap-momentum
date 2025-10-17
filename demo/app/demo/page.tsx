'use client';

import { useScrollContainer } from '../../hooks/useScrollContainer';
import Link from 'next/link';

export default function DemoPage() {
  const sections = [
    {
      id: 'hero',
      title: 'Welcome',
      color: 'bg-gradient-to-br from-blue-500 to-purple-600',
    },
    {
      id: 'about',
      title: 'About',
      color: 'bg-gradient-to-br from-purple-500 to-pink-600',
    },
    {
      id: 'features',
      title: 'Features',
      color: 'bg-gradient-to-br from-pink-500 to-orange-600',
    },
    {
      id: 'demo',
      title: 'Try It',
      color: 'bg-gradient-to-br from-orange-500 to-red-600',
    },
    {
      id: 'contact',
      title: 'Get Started',
      color: 'bg-gradient-to-br from-red-500 to-blue-600',
    },
  ];

  const { currentSection, containerRef, sectionRefs, scrollToSection } =
    useScrollContainer({
      totalSections: sections.length,
      updateURL: (index) => {
        window.history.pushState(null, '', `#${sections[index].id}`);
      },
    });

  return (
    <div className="relative">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            ← Back to Home
          </Link>
          <div className="text-sm text-gray-600">
            Section {currentSection + 1} / {sections.length}
          </div>
        </div>
      </header>

      {/* Navigation Dots */}
      <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSection === index
                ? 'bg-white scale-125 shadow-lg'
                : 'bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to ${section.title}`}
            title={section.title}
          />
        ))}
      </nav>

      {/* Scroll Container */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory"
      >
        {sections.map((section, index) => (
          <div
            key={section.id}
            ref={(el: HTMLDivElement | null) => {
              sectionRefs.current[index] = el;
            }}
            className={`h-screen snap-start flex items-center justify-center ${section.color}`}
          >
            <div className="text-center text-white px-6">
              <h1 className="text-7xl font-bold mb-6 drop-shadow-lg">
                {section.title}
              </h1>
              <p className="text-2xl opacity-90 mb-8">
                {index === 0 &&
                  'Try scrolling with your trackpad or mouse wheel'}
                {index === 1 &&
                  'Notice how it smoothly transitions between sections'}
                {index === 2 && 'Mac trackpad momentum is detected and handled'}
                {index === 3 && 'No more skipping multiple sections!'}
                {index === 4 && 'Ready to use this in your project?'}
              </p>

              {/* Action Buttons */}
              {index === 0 && (
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => scrollToSection(index + 1)}
                    className="px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all text-lg font-semibold"
                  >
                    Scroll Down ↓
                  </button>
                </div>
              )}

              {index === sections.length - 1 && (
                <div className="flex gap-4 justify-center flex-wrap">
                  <a
                    href="https://github.com/LinardsLiepenieks/react-scroll-snap-momentum"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-lg transition-all text-lg font-semibold"
                  >
                    ⭐ View on GitHub
                  </a>
                  <a
                    href="https://linardsliep.gumroad.com/l/react-scroll-snap"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all text-lg font-semibold"
                  >
                    📦 Download Package
                  </a>
                </div>
              )}

              {index > 0 && index < sections.length - 1 && (
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => scrollToSection(index - 1)}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all font-semibold"
                  >
                    ↑ Previous
                  </button>
                  <button
                    onClick={() => scrollToSection(index + 1)}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all font-semibold"
                  >
                    Next ↓
                  </button>
                </div>
              )}

              {/* Hint Text */}
              <p className="mt-12 text-sm opacity-75">
                {index < sections.length - 1
                  ? 'Use scroll wheel, trackpad, or click the dots →'
                  : 'Scroll up or use the dots to go back'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions Overlay (shows briefly on load) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-black/80 text-white px-6 py-3 rounded-full text-sm backdrop-blur-sm animate-pulse">
        👆 Try scrolling with your trackpad or mouse wheel
      </div>
    </div>
  );
}
