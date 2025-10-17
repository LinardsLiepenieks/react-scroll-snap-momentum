import { useEffect } from 'react';
import { useScrollContainer } from '../hooks/useScrollContainer';

/**
 * Advanced example with URL routing integration
 *
 * Features:
 * - URL hash navigation (#home, #about, etc.)
 * - Browser back/forward button support
 * - Deep linking (refresh on any section)
 * - Keyboard navigation
 */

function WithRoutingExample() {
  const sections = [
    { id: 'home', title: 'Home', description: 'Welcome to our site' },
    { id: 'about', title: 'About', description: 'Learn about us' },
    { id: 'services', title: 'Services', description: 'What we offer' },
    { id: 'portfolio', title: 'Portfolio', description: 'Our work' },
    { id: 'contact', title: 'Contact', description: 'Get in touch' },
  ];

  const {
    currentSection,
    containerRef,
    sectionRefs,
    scrollToSection,
    handlePopStateNavigation,
    handleURLSectionChange,
  } = useScrollContainer({
    totalSections: sections.length,
    updateURL: (index) => {
      const sectionId = sections[index].id;
      window.history.pushState(null, '', `#${sectionId}`);
      document.title = `${sections[index].title} - My Site`;
    },
  });

  // Handle initial URL hash on page load
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove #
    const sectionIndex = sections.findIndex((s) => s.id === hash);

    if (sectionIndex !== -1) {
      // Use instant scroll on initial load
      handleURLSectionChange(sectionIndex, 'instant');
    }
  }, []); // Only run once on mount

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.slice(1);
      const sectionIndex = sections.findIndex((s) => s.id === hash);

      if (sectionIndex !== -1) {
        handlePopStateNavigation(sectionIndex);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [sections, handlePopStateNavigation]);

  // Keyboard navigation (optional)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && currentSection < sections.length - 1) {
        e.preventDefault();
        scrollToSection(currentSection + 1);
      } else if (e.key === 'ArrowUp' && currentSection > 0) {
        e.preventDefault();
        scrollToSection(currentSection - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSection, sections.length, scrollToSection]);

  return (
    <div className="relative">
      {/* Fixed header with navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Site</h1>
            <ul className="flex gap-6">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(index)}
                    className={`transition-colors ${
                      currentSection === index
                        ? 'text-blue-600 font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* Scroll indicator */}
      <div
        className="fixed left-0 top-0 h-1 bg-blue-600 z-50 transition-all"
        style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
      />

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory"
      >
        {sections.map((section, index) => (
          <section
            key={section.id}
            ref={(el) => (sectionRefs.current[index] = el)}
            id={section.id}
            className="h-screen snap-start flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
          >
            <div className="text-center max-w-2xl px-6">
              <h2 className="text-5xl font-bold mb-4 text-gray-900">
                {section.title}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {section.description}
              </p>

              {/* Navigation hints */}
              <div className="flex gap-4 justify-center">
                {index > 0 && (
                  <button
                    onClick={() => scrollToSection(index - 1)}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    ← Previous
                  </button>
                )}
                {index < sections.length - 1 && (
                  <button
                    onClick={() => scrollToSection(index + 1)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Next →
                  </button>
                )}
              </div>

              {/* Keyboard hint */}
              <p className="mt-8 text-sm text-gray-500">
                Use ↑↓ arrow keys or scroll to navigate
              </p>
            </div>
          </section>
        ))}
      </div>

      {/* Section indicator (bottom right) */}
      <div className="fixed bottom-8 right-8 text-sm text-gray-600 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
        {currentSection + 1} / {sections.length}
      </div>
    </div>
  );
}

export default WithRoutingExample;
