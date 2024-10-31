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
    <header className="px-4 lg:px-6 h-16 flex items-center bg-white border-b border-blue-100">
      <div className="flex items-center space-x-2">
        <Phone className="h-6 w-6 text-blue-600" />
        <Link href="/">
          <h1 className="text-4xl font-bold text-blue-900">graham</h1>
        </Link>
      </div>
      <NavLinks />
      <UserActions isSignedIn={isSignedIn} userId={userId} />
    </header>
  )
}

function NavLinks() {
  return (
    <nav className="ml-auto hidden md:flex gap-4 sm:gap-6">
      <Link href="/subscription" className="text-blue-700 hover:text-blue-900 hover:underline underline-offset-4">
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
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">Dashboard</Button>
          </Link>
          <Link href={`/dashboard/profile/${userId}`}>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">Profile</Button>
          </Link>
          <UserButton />
        </>
      ) : (
        <>
          <Link href="/dashboard">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">Sign Up</Button>
          </Link>
        </>
      )}
    </div>
  )
}