'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          React Scroll-Snap Momentum
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Stop fighting Mac trackpad momentum scrolling
        </p>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12">
          React hooks for smooth section-by-section scrolling with intelligent
          momentum detection using delta pattern analysis
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/demo"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-semibold transition-colors"
          >
            Try Live Demo →
          </Link>
          <a
            href="https://github.com/LinardsLiepenieks/react-scroll-snap-momentum"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-lg font-semibold transition-colors"
          >
            ⭐ View on GitHub
          </a>
          <a
            href="https://linardsliep.gumroad.com/l/react-scroll-snap"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-900 rounded-lg text-lg font-semibold transition-colors"
          >
            📦 Download Package
          </a>
        </div>
      </section>

      {/* Problem Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">The Problem</h2>
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <p className="text-lg text-gray-700 mb-4">
              When you build custom scroll-snap sections, Mac trackpads generate{' '}
              <strong>40+ scroll events</strong> from a single swipe due to
              momentum/inertia.
            </p>
            <p className="text-lg text-gray-700">
              This causes your page to skip multiple sections uncontrollably.
              Users hate it. Designers hate it. You'll hate debugging it.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="container mx-auto px-6 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">The Solution</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 border-2 border-gray-200 rounded-lg">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">Delta Pattern Analysis</h3>
              <p className="text-gray-600">
                Detects momentum by analyzing scroll event timing, direction,
                and delta decay patterns
              </p>
            </div>
            <div className="p-6 border-2 border-gray-200 rounded-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Adaptive Throttling</h3>
              <p className="text-gray-600">
                600ms for intentional scrolls, 1800ms for momentum cascades
              </p>
            </div>
            <div className="p-6 border-2 border-gray-200 rounded-lg">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">Cross-Device Support</h3>
              <p className="text-gray-600">
                Works with trackpads, mice, and touch gestures on mobile
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-4">Quick Start</h3>
            <pre className="bg-gray-800 rounded p-4 overflow-x-auto text-sm">
              <code>{`import { useScrollContainer } from './hooks/useScrollContainer';

function App() {
  const { containerRef, sectionRefs, currentSection } = 
    useScrollContainer({
      totalSections: 4,
      updateURL: (index) => {
        window.history.pushState(null, '', \`#section-\${index}\`);
      }
    });

  return (
    <div ref={containerRef} className="h-screen overflow-y-scroll">
      {['Home', 'About', 'Services', 'Contact'].map((section, i) => (
        <div 
          key={section}
          ref={el => sectionRefs.current[i] = el}
          className="h-screen snap-start"
        >
          {section}
        </div>
      ))}
    </div>
  );
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="text-2xl">✅</div>
              <div>
                <h3 className="font-bold mb-1">Zero Dependencies</h3>
                <p className="text-gray-600">
                  Just React. No external libraries.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-2xl">✅</div>
              <div>
                <h3 className="font-bold mb-1">TypeScript</h3>
                <p className="text-gray-600">Full type definitions included</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-2xl">✅</div>
              <div>
                <h3 className="font-bold mb-1">Composable Hooks</h3>
                <p className="text-gray-600">Use individually or together</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="text-2xl">✅</div>
              <div>
                <h3 className="font-bold mb-1">Production Ready</h3>
                <p className="text-gray-600">
                  Tested across devices and browsers
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Try It?</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          See it in action with a live demo, or grab the code and start building
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/demo"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-semibold transition-colors"
          >
            Try Live Demo →
          </Link>
          <a
            href="https://github.com/LinardsLiepenieks/react-scroll-snap-momentum"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-900 rounded-lg text-lg font-semibold transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="container mx-auto px-6 text-center text-gray-600">
          <p className="mb-4">
            Built by{' '}
            <a
              href="https://www.linkedin.com/in/linards-liepenieks/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Linards Liepenieks
            </a>
          </p>
          <p className="mb-4">
            Need help implementing this?{' '}
            <a
              href="mailto:linardsliepenieks@gmail.com"
              className="text-blue-600 hover:underline"
            >
              Free 20-minute consultation
            </a>
          </p>
          <p className="text-sm">
            <a
              href="https://dev.to/your-blog-post"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Read the full story
            </a>
            {' · '}
            MIT License
          </p>
        </div>
      </footer>
    </main>
  );
}
