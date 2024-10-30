import * as React from "react"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Phone } from "lucide-react"
import { auth } from "@clerk/nextjs/server"

export async function Navbar() {
  const { userId } = auth()
  const isSignedIn = !!userId

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-white border-b ">
      <div className="flex items-center space-x-2">
        <Phone className="h-6 w-6 text-[#8B4513]" />
        <Link href="/">
          <h1 className="text-4xl font-bold text-[#8B4513]">graham</h1>
        </Link>
      </div>
      <NavLinks />
      <UserActions isSignedIn={isSignedIn} userId={userId} /> 
      {/* <MobileMenuToggle /> */}
    </header>
  )
}

function NavLinks() {
  return (
    <nav className="ml-auto hidden md:flex gap-4 sm:gap-6">
      <Link href="/subscription" className="text-[#8B4513] hover:underline underline-offset-4">
        Pricing
      </Link>
    </nav>
  )
}

function UserActions({ isSignedIn, userId }: { isSignedIn: boolean, userId: string | null }) {
  return (
    <div className="ml-4 hidden md:flex items-center space-x-4">
      {isSignedIn ? (
        <>
          <Link href="/dashboard">
            <Button variant="outline" className="bg-[#8B4513] text-white hover:bg-[#A0522D]">Dashboard</Button>
          </Link>
          <Link href={`/dashboard/profile/${userId}`}>
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
  )
}