'use client'
import React from 'react'
import { Button } from "@/components/ui/button"
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

const Error = ({ error, reset }: { error: Error; reset: () => void }) => {
  const router = useRouter()

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-4">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
      <p className="text-gray-600 mb-6">{error?.message || 'An unexpected error occurred'}</p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="outline">
          Try again
        </Button>
        <Button onClick={() => router.push('/dashboard')} variant="default">
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}

export default Error