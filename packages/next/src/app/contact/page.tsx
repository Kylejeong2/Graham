import React from 'react'
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { EnterpriseContactForm } from '@/components/Common/EnterpriseContactForm'

export const metadata: Metadata = {
  title: 'Enterprise Contact | Graham AI',
  description: 'Contact Graham AI for enterprise inquiries and learn how we can transform your business communications.',
}

export default function EnterpriseContactPage() {
  return (
    <>
      <Toaster />
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
            <EnterpriseContactForm />
        </main>
      </div>
    </>
  )
}