"use client"

import React from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { Button } from "@/components/Common/Button"
import { Separator } from "@/components/Common/Separator"
import useSubscriptions from "@/hooks/getSubscriptionData"
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Loader2, User, Mail, CreditCard, Calendar, AlertTriangle, LogOut } from "lucide-react"

const ProfilePage = ({ params: { id } }: { params: { id: string } }) => {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { subscription, loading, error } = useSubscriptions()
  const router = useRouter()

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { url } = await response.json();
        router.push(url);
      } else {
        const errorData = await response.json();
        console.error('Error creating portal session:', errorData);
        toast.error(errorData.error || 'Failed to open subscription management');
      }
    } catch (error) {
      console.error('Error managing subscription:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleSignOut = () => {
    signOut()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    )
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-white">Error: {error}</div>
  }

  return (
    <div className="min-h-screen bg-black text-white grainy">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">Account Profile</h1>
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center text-green-400">
                <User className="mr-2" /> Account Information
              </h2>
              <p className="flex items-center">
                <User className="mr-2 w-5 h-5 text-green-500" /> {user?.firstName} {user?.lastName}
              </p>
              <p className="flex items-center">
                <Mail className="mr-2 w-5 h-5 text-green-500" /> {user?.primaryEmailAddress?.emailAddress}
              </p>

              <Separator className="my-6 bg-gray-700" />

              <Button onClick={handleSignOut} variant="destructive" className="w-full bg-red-600 hover:bg-red-700">
                <LogOut className="mr-2 w-4 h-4" /> Sign Out
              </Button>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4 flex items-center text-green-400">
                <CreditCard className="mr-2" /> Subscription Details
              </h2>
              {subscription ? (
                <div className="bg-gray-700 p-6 rounded-lg shadow-inner">
                  <p className="mb-3 flex items-center">
                    <CreditCard className="mr-2 w-5 h-5 text-green-500" /> Plan: <span className="font-medium ml-1 text-green-400">{subscription.subscriptionName}</span>
                  </p>
                  {subscription.subscriptionCancelAt && (
                    <p className="mb-3 flex items-center text-yellow-400">
                      <AlertTriangle className="mr-2 w-5 h-5" /> Ending on: <span className="font-medium ml-1">{new Date(subscription.subscriptionCancelAt).toLocaleDateString()}</span>
                    </p>
                  )}
                  <p className="mb-3 flex items-center">
                    <Calendar className="mr-2 w-5 h-5 text-green-500" /> Billing: <span className="font-medium ml-1">{subscription.isYearly ? 'Yearly' : 'Monthly'}</span>
                  </p>
                  <p className="mb-4 flex items-center">
                    <Calendar className="mr-2 w-5 h-5 text-green-500" /> Next Billing: <span className="font-medium ml-1">{new Date(subscription.stripeCurrentPeriodEnd).toLocaleDateString()}</span>
                  </p>
                  {subscription && (
                    <Button onClick={handleManageSubscription} variant="outline" className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <CreditCard className="mr-2 w-4 h-4" /> Manage Subscription
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 flex items-center bg-gray-700 p-6 rounded-lg">
                  <AlertTriangle className="mr-2 w-5 h-5 text-yellow-500" /> You are not currently subscribed to any plan.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage