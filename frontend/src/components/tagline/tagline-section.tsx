"use client";

export function TaglineSection() {
  return (
    <section id="about-section" className="py-16 lg:py-24 bg-gradient-to-br from-orange-50 via-white to-amber-50 relative">
      {/* Top border separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent"></div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
          <pattern id="tagline-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <path d="M10 10L15 5L10 0L5 5Z" fill="currentColor" />
          </pattern>
         
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Top spacing */}
          <div className="mb-8">
            <div className="flex justify-center items-center space-x-4">
              <div className="w-24 h-px bg-gradient-to-r from-transparent to-orange-400"></div>
              <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full animate-pulse-soft"></div>
              <div className="w-24 h-px bg-gradient-to-l from-transparent to-amber-400"></div>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-8">
            <span className="text-primary">
              From Every State,
            </span>
            <br />
            <span className="text-gray-800">For Every Heart</span>
          </h2>

          {/* Bottom decorative elements */}
          <div className="flex justify-center items-center space-x-4">
            <div className="w-24 h-px bg-gradient-to-r from-transparent to-orange-400"></div>
            <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full animate-pulse-soft" style={{ animationDelay: "1s" }}></div>
            <div className="w-24 h-px bg-gradient-to-l from-transparent to-amber-400"></div>
          </div>
        </div>
      </div>

      {/* Bottom border separator */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
    </section>
  );
}
