import React from 'react';
import { auth } from "@clerk/nextjs/server";
import { SignInButton } from '@clerk/nextjs';

export default async function ContactPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
          {userId ? (
            <>
              <p className="text-gray-600 mb-6">
                Have questions? We&apos;d love to hear from you.
              </p>
              <div className="mt-4">
                <a 
                  href="mailto:info@zurichshows.com"
                  className="text-xl font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  info@zurichshows.com
                </a>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Please sign in to view our contact information.
              </p>
              <SignInButton mode="modal">
              <button className="px-4 py-2.5 text-base font-medium transition-colors cursor-pointer">
                Sign In
              </button>
            </SignInButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
