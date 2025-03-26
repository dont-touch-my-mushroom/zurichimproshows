'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
  } from '@clerk/nextjs'

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="https://improfestivals.com/assets/images/logo_name_white.png"
                alt="Logo"
                width={140}
                height={50}
                priority
              />
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/list"
              className="text-primary-foreground hover:text-primary-foreground/80 px-4 py-2.5 text-base font-medium transition-colors"
            >
              Festivals
            </Link>
            <Link
              href="/contact"
              className="text-primary-foreground hover:text-primary-foreground/80 px-4 py-2.5 text-base font-medium transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/festival-form"
              className="text-primary-foreground hover:text-primary-foreground/80 px-4 py-2.5 text-base font-medium transition-colors"
            >
              Add Festival
            </Link>
            <SignedOut>
                <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;