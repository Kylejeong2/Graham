'use client'

import * as React from "react"
import Link from "next/link"
import { UserButton, useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function Navbar() {
  const { userId } = useAuth()
  const isSignedIn = !!userId

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-sm bg-white/80 border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center">
        {/* Logo section - fixed width */}
        <div className="w-[200px] flex items-center space-x-2 py-2">
          <div className="flex items-center hover:opacity-80 transition-opacity py-2">
            <Image src="/logo/graham_transparent.png" alt="Graham Logo" width={70} height={70} className="mr-0 -mb-1"/>
            <Link href="/">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent -ml-1 -mt-4">raham</h1>
            </Link>
          </div>
        </div>

        {/* NavLinks - centered with flex-1 */}
        <div className="flex-1 flex justify-center">
          <NavLinks />
        </div>

        {/* UserActions section - fixed width */}
        <div className="w-[200px] flex justify-end">
          <UserActions isSignedIn={isSignedIn} userId={userId || ''} />
        </div>
      </div>
    </header>
  )
}

function NavLinks() {
  return (
    <nav className="hidden md:flex gap-6">
      <Link 
        href="/#pricing" 
        className="text-gray-600 hover:text-orange-600 transition-colors"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        Pricing
      </Link>
      <Link 
        href="/#features" 
        className="text-gray-600 hover:text-orange-600 transition-colors"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        Features
      </Link>
      <Link 
        href="/#how-it-works" 
        className="text-gray-600 hover:text-orange-600 transition-colors"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        How It Works
      </Link>
    </nav>
  )
}

function UserActions({ isSignedIn, userId }: { isSignedIn: boolean, userId: string | null }) {
  return (
    <div className="hidden md:flex items-center space-x-4">
      {isSignedIn ? (
        <>
          <Link href="/dashboard">
            <Button variant="outline" className="border-orange-600 text-orange-600 hover:text-white hover:bg-orange-600">Dashboard</Button>
          </Link>
          <Link href={`/dashboard/profile/${userId}`}>
            <Button className="bg-orange-600 text-white hover:bg-orange-700">Profile</Button>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </>
      ) : (
        <>
          <Link href="/sign-in">
            <Button variant="outline" className="border-orange-600 text-orange-600 hover:text-white hover:bg-orange-600">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-orange-600 text-white hover:bg-orange-700">Get Started</Button>
          </Link>
        </>
      )}
    </div>
  )
}