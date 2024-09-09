'use client'

import React, { useState, useEffect } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import useSubscriptions from "@/hooks/getSubscriptionData"
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Loader2, User, Mail, CreditCard, Calendar, AlertTriangle, LogOut, Package, Phone, Bell, Shield, ChevronRight, Eye, EyeOff } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const ProfilePage = ({ params: { id } }: { params: { id: string } }) => {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const { subscription, loading, error } = useSubscriptions()
  const router = useRouter()

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [newFirstName, setNewFirstName] = useState(user?.firstName || '')
  const [newLastName, setNewLastName] = useState(user?.lastName || '')
  const [newPhoneNumber, setNewPhoneNumber] = useState(user?.phoneNumbers[0]?.phoneNumber || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    } 
  }, [isLoaded, isSignedIn, router])

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

  const handleEditProfile = async () => {
    try {
      await user?.update({
        firstName: newFirstName,
        lastName: newLastName,
      })
      toast.success('Profile updated successfully')
      setIsEditProfileOpen(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match')
      return
    }
    try {
      await user?.updatePassword({
        currentPassword,
        newPassword
      })
      toast.success('Password changed successfully')
      setIsChangePasswordOpen(false)
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    }
  }

  const handleManageNotifications = (type: 'email' | 'sms') => {
    // Implement notification management logic
    console.log(`Managing ${type} notifications`)
    toast.info(`${type.toUpperCase()} notification settings opened`)
  }

  const handleEnableTwoFactor = async () => {
    try {
      // await user?.createTwoFactorEnrollment({ strategy: 'email_code' })
      toast.success('Two-factor authentication setup initiated')
    } catch (error) {
      console.error('Error enabling two-factor authentication:', error)
      toast.error('Failed to initiate two-factor authentication setup')
    }
  }

  const handleViewLoginHistory = () => {
    // Implement login history view logic
    console.log('Viewing login history')
    toast.info('Login history view opened')
  }

  const handleManageDataPrivacy = () => {
    // Implement data privacy management logic
    console.log('Managing data privacy settings')
    toast.info('Data privacy settings opened')
  }

  if (loading || !isLoaded) {
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
    <div className="min-h-screen bg-[#F5E6D3] text-[#5D4037] py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
          <CardHeader className="bg-[#8B4513] text-white p-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 border-2 border-white">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="bg-[#A0522D] text-white text-xl">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl font-bold text-white">{user?.firstName} {user?.lastName}</CardTitle>
                <p className="text-sm text-white flex items-center">
                  <Mail className="mr-1 w-4 h-4" /> {user?.primaryEmailAddress?.emailAddress}
                </p>
                <p className="text-sm text-white flex items-center">
                  <Phone className="mr-1 w-4 h-4" /> {user?.phoneNumbers[0]?.phoneNumber || 'No phone number'}
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
                        <span className="text-lg text-[#5D4037]">{subscription?.isYearly ? 'Yearly' : 'Monthly'}</span>
                      </div>
                      <Separator className="bg-[#8B4513] opacity-20" />
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-[#5D4037]">Next Billing Date</span>
                        <span className="text-lg text-[#5D4037]">{new Date(subscription.stripeCurrentPeriodEnd).toLocaleDateString()}</span>
                      </div>
                      <Separator className="bg-[#8B4513] opacity-20" />
                      {subscription.subscriptionCancelAt && (
                        <>
                          <div className="flex justify-between items-center text-[#A0522D]">
                            <span className="text-lg font-medium">Cancellation Date</span>
                            <span className="text-lg">{new Date(subscription.subscriptionCancelAt).toLocaleDateString()}</span>
                          </div>
                          <Separator className="bg-[#8B4513] opacity-20" />
                        </>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-[#5D4037]">Phone Numbers</span>
                        <span className="text-lg text-[#5D4037]">
                          {JSON.stringify(user?.phoneNumbers, null, 2)}
                        </span>
                      </div>
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
                    <Button variant="outline" className="w-full border-[#8B4513] text-white hover:bg-[#E6CCB2] text-lg py-6" onClick={() => setIsEditProfileOpen(true)}>
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="w-full border-[#8B4513] text-white hover:bg-[#E6CCB2] text-lg py-6" onClick={() => setIsChangePasswordOpen(true)}>
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
                        <Button variant="outline" size="sm" className="border-[#8B4513] text-white" onClick={() => handleManageNotifications('email')}>
                          Manage
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#5D4037]">SMS Alerts</span>
                        <Button variant="outline" size="sm" className="border-[#8B4513] text-white" onClick={() => handleManageNotifications('sms')}>
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
                <Button variant="outline" className="border-[#8B4513] text-white hover:bg-[#E6CCB2]" onClick={handleEnableTwoFactor}>
                  Enable
                </Button>
              </div>
              <Separator className="bg-[#8B4513] opacity-20" />
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-[#5D4037]">Login History</h3>
                  <p className="text-sm text-[#795548]">View your recent login activity</p>
                </div>
                <Button variant="ghost" className="text-[#8B4513] hover:bg-[#E6CCB2]" onClick={handleViewLoginHistory}>
                  View History <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
              <Separator className="bg-[#8B4513] opacity-20" />
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-[#5D4037]">Data Privacy</h3>
                  <p className="text-sm text-[#795548]">Manage your data and privacy settings</p>
                </div>
                <Button variant="ghost" className="text-[#8B4513] hover:bg-[#E6CCB2]" onClick={handleManageDataPrivacy}>
                  Manage Settings <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="bg-[#F5E6D3]">
          <DialogHeader>
            <DialogTitle className="text-[#8B4513]">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName" className="text-[#5D4037]">First Name</Label>
              <Input id="firstName" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} className="bg-white text-black border-[#8B4513]" />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-[#5D4037]">Last Name</Label>
              <Input id="lastName" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} className="bg-white text-black border-[#8B4513]" />
            </div>
            <div>
              <Label htmlFor="phoneNumber" className="text-[#5D4037]">Phone Number</Label>
              <Input id="phoneNumber" value={newPhoneNumber} onChange={(e) => setNewPhoneNumber(e.target.value)} className="bg-white text-black border-[#8B4513]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-[#8B4513] text-white" onClick={() => setIsEditProfileOpen(false)}>Cancel</Button>
            <Button className="bg-[#8B4513] text-white hover:bg-[#A0522D]" onClick={handleEditProfile}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="bg-[#F5E6D3]">
          <DialogHeader>
            <DialogTitle className="text-[#8B4513]">Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="text-[#5D4037]">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-white text-black border-[#8B4513] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-[#5D4037]">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white text-black border-[#8B4513] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmNewPassword" className="text-[#5D4037]">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmNewPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="bg-white text-black border-[#8B4513] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                >
                  {showConfirmNewPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-[#8B4513] text-white" onClick={() => setIsChangePasswordOpen(false)}>Cancel</Button>
            <Button className="bg-[#8B4513] text-white hover:bg-[#A0522D]" onClick={handleChangePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProfilePage