'use client'

import React from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import useSubscriptions from "@/hooks/getSubscriptionData"
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Loader2, User, Mail, CreditCard, Calendar, AlertTriangle, LogOut, Package, Phone, Bell, Shield, ChevronRight } from "lucide-react"

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
      <div className="flex items-center justify-center min-h-screen bg-[#F5E6D3]">
        <Loader2 className="w-12 h-12 animate-spin text-[#8B4513]" />
      </div>
    )
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-[#F5E6D3] text-[#5D4037]">Error: {error}</div>
  }

  return (
    <div className="min-h-screen bg-[#F5E6D3] text-[#5D4037] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
          <CardHeader className="bg-[#8B4513] text-white p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-24 h-24 border-4 border-white">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="bg-[#A0522D] text-white text-3xl">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <CardTitle className="text-4xl font-bold mb-2 text-white">{user?.firstName} {user?.lastName}</CardTitle>
                <p className="text-white flex items-center justify-center md:justify-start text-lg">
                  <Mail className="mr-2 w-5 h-5" /> {user?.primaryEmailAddress?.emailAddress}
                </p>
                <p className="text-white flex items-center justify-center md:justify-start mt-2 text-lg">
                  <Phone className="mr-2 w-5 h-5" /> +1 (555) 123-4567
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="col-span-2 bg-white">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold text-[#8B4513] flex items-center">
                    <Package className="mr-3 w-6 h-6" /> Subscription Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subscription ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-[#5D4037]">Plan</span>
                        <span className="text-xl font-bold text-[#8B4513]">{subscription.subscriptionName}</span>
                      </div>
                      <Separator className="bg-[#8B4513] opacity-20" />
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-[#5D4037]">Billing Cycle</span>
                        <span className="text-lg text-[#5D4037]">{subscription.isYearly ? 'Yearly' : 'Monthly'}</span>
                      </div>
                      <Separator className="bg-[#8B4513] opacity-20" />
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-[#5D4037]">Next Billing Date</span>
                        <span className="text-lg text-[#5D4037]">{new Date(subscription.stripeCurrentPeriodEnd).toLocaleDateString()}</span>
                      </div>
                      {subscription.subscriptionCancelAt && (
                        <>
                          <Separator className="bg-[#8B4513] opacity-20" />
                          <div className="flex justify-between items-center text-[#A0522D]">
                            <span className="text-lg font-medium">Cancellation Date</span>
                            <span className="text-lg">{new Date(subscription.subscriptionCancelAt).toLocaleDateString()}</span>
                          </div>
                        </>
                      )}
                      <div className="mt-6">
                        <p className="text-lg font-medium text-[#5D4037] mb-2">Usage This Month</p>
                        <Progress value={65} className="h-3 bg-[#E6CCB2]" />
                        <div className="bg-[#8B4513] h-3 rounded-full" style={{ width: '65%' }}></div>
                        <p className="text-right text-sm text-[#5D4037] mt-1">650 / 1000 calls</p>
                      </div>
                      <Button onClick={handleManageSubscription} className="w-full mt-6 bg-[#8B4513] hover:bg-[#A0522D] text-white text-lg py-6">
                        <CreditCard className="mr-2 w-5 h-5" /> Manage Subscription
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="mx-auto w-16 h-16 text-[#A0522D] mb-4" />
                      <p className="text-xl text-[#5D4037] mb-4">You are not currently subscribed to any plan.</p>
                      <Button className="bg-[#8B4513] hover:bg-[#A0522D] text-white text-lg py-6 px-8">
                        View Available Plans
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              <div className="space-y-8">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-[#8B4513] flex items-center">
                      <User className="mr-2 w-5 h-5" /> Account Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full border-[#8B4513] text-white hover:bg-[#E6CCB2] text-lg py-6">
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="w-full border-[#8B4513] text-white hover:bg-[#E6CCB2] text-lg py-6">
                      Change Password
                    </Button>
                    <Separator className="bg-[#8B4513] opacity-20" />
                    <Button onClick={handleSignOut} variant="destructive" className="w-full bg-[#A0522D] hover:bg-[#8B4513] text-white text-lg py-6">
                      <LogOut className="mr-2 w-5 h-5" /> Sign Out
                    </Button>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-[#8B4513] flex items-center">
                      <Bell className="mr-2 w-5 h-5" /> Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[#5D4037]">Email Notifications</span>
                        <Button variant="outline" size="sm" className="border-[#8B4513] text-white">
                          Manage
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#5D4037]">SMS Alerts</span>
                        <Button variant="outline" size="sm" className="border-[#8B4513] text-white">
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-xl rounded-lg overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-[#8B4513] flex items-center">
              <Shield className="mr-3 w-6 h-6" /> Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-[#5D4037]">Two-Factor Authentication</h3>
                  <p className="text-sm text-[#795548]">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" className="border-[#8B4513] text-white hover:bg-[#E6CCB2]">
                  Enable
                </Button>
              </div>
              <Separator className="bg-[#8B4513] opacity-20" />
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-[#5D4037]">Login History</h3>
                  <p className="text-sm text-[#795548]">View your recent login activity</p>
                </div>
                <Button variant="ghost" className="text-[#8B4513] hover:bg-[#E6CCB2]">
                  View History <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
              <Separator className="bg-[#8B4513] opacity-20" />
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-[#5D4037]">Data Privacy</h3>
                  <p className="text-sm text-[#795548]">Manage your data and privacy settings</p>
                </div>
                <Button variant="ghost" className="text-[#8B4513] hover:bg-[#E6CCB2]">
                  Manage Settings <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProfilePage