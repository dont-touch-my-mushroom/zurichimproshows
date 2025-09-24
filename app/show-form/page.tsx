"use client"

import { ShowForm } from "@/components/form/show-form"
import { useAuth } from "@clerk/nextjs"
import { SignInButton } from "@clerk/nextjs"

export default function ShowFormPage() {
  const { isSignedIn } = useAuth()
 
  if (!isSignedIn) {
    return (
      <div className="py-10 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-center">Show Information</h1>
        <div className="p-10 border rounded-lg bg-secondary/10 shadow-sm max-w-md w-full flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold mb-4">Sign in to add a new show</h2>
          <p className="mb-8">You need to be logged in to add a new show. Please sign in to continue.</p>
          <SignInButton mode="modal">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 py-3 px-6 rounded-md font-medium transition-colors">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    )
  }
  
  return (
    <div className="py-10">
      <h1 className="text-3xl font-bold mb-6">Show Information</h1>
      <ShowForm />
    </div>
  )
}

