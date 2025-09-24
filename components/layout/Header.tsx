'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs';
import { Menu } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="https://storage.googleapis.com/improfestivals_images/logo_name_white.png"
                alt="Zurich Shows"
                width={140}
                height={50}
                priority
                className="w-auto h-8 md:h-auto md:w-[140px]"
                unoptimized
              />
            </Link>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/list"
              className="text-primary-foreground hover:text-primary-foreground/80 px-4 py-2.5 text-base font-medium transition-colors"
            >
              Shows
            </Link>
            <Link
              href="/contact"
              className="text-primary-foreground hover:text-primary-foreground/80 px-4 py-2.5 text-base font-medium transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/show-form"
              className="text-primary-foreground hover:text-primary-foreground/80 px-4 py-2.5 text-base font-medium transition-colors"
            >
              Add Show
            </Link>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-primary-foreground hover:text-primary-foreground/80 px-4 py-2.5 text-base font-medium transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground">
                  <Menu className="h-6 w-6" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-4">
                <div className="flex flex-col space-y-4">
                  <Link
                    href="/list"
                    className="text-primary hover:text-primary/80 text-base font-medium transition-colors"
                  >
                    Shows
                  </Link>
                  <Link
                    href="/contact"
                    className="text-primary hover:text-primary/80 text-base font-medium transition-colors"
                  >
                    Contact
                  </Link>
                  <Link
                    href="/show-form"
                    className="text-primary hover:text-primary/80 text-base font-medium transition-colors"
                  >
                    Add Show
                  </Link>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="text-primary hover:text-primary/80 text-base font-medium transition-colors cursor-pointer text-left">
                        Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <div className="flex justify-center">
                      <UserButton />
                    </div>
                  </SignedIn>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;