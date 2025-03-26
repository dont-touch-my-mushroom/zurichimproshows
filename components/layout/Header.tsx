'use client';

import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/next.svg"
                alt="Logo"
                width={120}
                height={30}
                priority
              />
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/about"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="/schedule"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Schedule
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;