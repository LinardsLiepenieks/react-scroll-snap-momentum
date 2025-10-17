import { useScrollContainer } from '../hooks/useScrollContainer';

/**
 * Basic vertical scroll-snap example
 *
 * Features:
 * - Full-page sections
 * - Smooth transitions
 * - Momentum detection
 * - Active section indicator
 */

function BasicExample() {
  const sections = [
    { id: 'home', title: 'Welcome', color: 'bg-blue-500' },
    { id: 'about', title: 'About Us', color: 'bg-purple-500' },
    { id: 'services', title: 'Our Services', color: 'bg-green-500' },
    { id: 'contact', title: 'Get in Touch', color: 'bg-orange-500' },
  ];

  const { currentSection, containerRef, sectionRefs, scrollToSection } =
    useScrollContainer({
      totalSections: sections.length,
      updateURL: (index) => {
        // Update URL hash when section changes
        const sectionId = sections[index].id;
        window.history.pushState(null, '', `#${sectionId}`);
      },
    });

  return (
    <div className="relative">
      {/* Navigation dots */}
      <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSection === index
                ? 'bg-white scale-125'
                : 'bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to ${section.title}`}
          />
        ))}
      </nav>

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory"
      >
        {sections.map((section, index) => (
          <section
            key={section.id}
            ref={(el) => (sectionRefs.current[index] = el)}
            className={`h-screen snap-start flex items-center justify-center ${section.color}`}
          >
            <div className="text-center text-white">
              <h1 className="text-6xl font-bold mb-4">{section.title}</h1>
              <p className="text-xl opacity-90">
                Section {index + 1} of {sections.length}
              </p>
              {index < sections.length - 1 && (
                <button
                  onClick={() => scrollToSection(index + 1)}
                  className="mt-8 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  Next Section ↓
                </button>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default BasicExample;
