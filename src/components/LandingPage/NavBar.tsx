'use client';

import * as React from "react"
import { useState } from "react"
import Image from 'next/image'
import Link from "next/link"
import { useUser, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
import AnimatedLink from "@/components/Common/AnimatedLink"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, user } = useUser();

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-[#F5E6D3] border-b border-[#8B4513]">
      <div className="flex items-center space-x-2">
        <Phone className="h-6 w-6 text-[#8B4513]" />
        <Link href="/">
          <h1 className="text-2xl font-bold text-[#8B4513]">Graham</h1>
        </Link>
      </div>
      <nav className={`ml-auto flex gap-4 sm:gap-6 ${isOpen ? 'flex' : 'hidden md:flex'}`}>
        <Link href="/#features" className="text-[#8B4513] hover:underline underline-offset-4">
          <AnimatedLink title="Features" />
        </Link>
        <Link href="/#how-it-works" className="text-[#8B4513] hover:underline underline-offset-4">
          <AnimatedLink title="How It Works" />
        </Link>
        <Link href="/#pricing" className="text-[#8B4513] hover:underline underline-offset-4">
          <AnimatedLink title="Pricing" />
        </Link>
        <Link href="/#testimonials" className="text-[#8B4513] hover:underline underline-offset-4">
          <AnimatedLink title="Testimonials" />
        </Link>
      </nav>
      <div className={`ml-4 flex items-center space-x-4 ${isOpen ? 'flex' : 'hidden md:flex'}`}>
        {isSignedIn ? (
          <>
            <Link href="/dashboard" className="text-[#8B4513] hover:underline underline-offset-4">
                <Button variant="outline" className="bg-[#8B4513] text-white hover:bg-[#A0522D]">Dashboard</Button>
            </Link>
            <Link href={`/dashboard/profile/${user?.id}`} className="text-[#8B4513] hover:underline underline-offset-4">
              <Button className="bg-[#8B4513] text-white hover:bg-[#A0522D]">Profile</Button>
            </Link>
            <UserButton />
          </>
        ) : (
          <>
            <Link href="/dashboard">
              <Button variant="outline" className="bg-[#8B4513] text-white hover:bg-[#A0522D]">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-[#8B4513] text-white hover:bg-[#A0522D]">Sign Up</Button>
            </Link>
          </>
        )}
      </div>
      <button 
        className="ml-4 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image src="/svgs/ic_bars.svg" alt="Menu" width={24} height={24} />
      </button>
    </header>
  )
}